import { glob } from "glob";
import fs from "fs";
import { TrxData, TrxDataWrapper, UnitTest } from "./types";
import { promises } from "fs";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { Result } from "../types";

const GLOB_PATTERN = process.env["GLOB_PATTERN"] ?? "**/*.{trx,tap}";
const GLOB_IGNORE = process.env["GLOB_IGNORE"] ?? "node_modules/**";

async function getTrxFiles() {
  const trxFiles = await glob(GLOB_PATTERN, { ignore: GLOB_IGNORE });
  return trxFiles;
}

export async function getTrxTestResults(): Promise<
  { name: string; results: Result[] }[]
> {
  const tapFiles = await getTrxFiles();

  return await Promise.all(
    tapFiles
      .filter((file) => file.endsWith(".trx"))
      .map(async (file) => {
        const tapData = fs.readFileSync(file).toString();
        const result = await transformTrxToJson(tapData);

        return {
          name: file,
          results: Object.values(denormalize(result)).map(trxToTap),
        };
      })
  );
}

function trxToTap(r: any) {
  return {
    ok: r?.Execution["_outcome"] === "Passed",
    name: r?.Execution?._testName,
    id: r?.Execution?._executionId,
    buffered: false,
    tapError: null,
    skip: false,
    todo: false,
    previous: null,
    plan: null,
    diag: r?.Execution?.Output?.ErrorInfo,
    time: 0,
    fullname: r?.Execution?._testName,
    closingTestPoint: false,
  };
}

function denormalize(result: any) {
  //@ts-ignore
  const unitTestResults = result["TestRun"]["Results"][
    "UnitTestResult" //@ts-ignore
  ].reduce((acc, result) => {
    //@ts-ignore
    acc[result["_executionId"]] = result;
    return acc;
  }, {});
  //@ts-ignore
  const unitTest = result["TestRun"]["TestDefinitions"][
    "UnitTest" //@ts-ignore
  ].reduce((acc, result) => {
    //@ts-ignore
    acc[result["_id"]] = result;
    const resultId = result["Execution"]["_id"];
    acc[result["_id"]]["Execution"] = unitTestResults[resultId];
    return acc;
  }, {});
  return unitTest;
}

export async function transformTrxToJson(
  xmlData: string
): Promise<TrxDataWrapper> {
  let trxDataWrapper: any;

  const options = {
    attributeNamePrefix: "_",
    // attrNodeName: '@', //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: false,
    ignoreNameSpace: false,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    format: true,
    indentBy: "  ",
    supressEmptyNode: false,
    rootNodeName: "element",
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false, //"strict"
    stopNodes: ["parse-me-as-string"],
  };

  const xmlParser = new XMLParser(options);
  const isValid = XMLValidator.validate(xmlData, {
    allowBooleanAttributes: true,
  });
  if (isValid === true) {
    const jsonString = xmlParser.parse(xmlData, true);
    // const testData = jsonString as TrxData;
    // const reportHeaders = getReportHeaders(testData);
    // trxDataWrapper = {
    //   TrxData: jsonString as TrxData,
    //   IsEmpty: IsEmpty(testData),
    //   ReportMetaData: {
    //     ReportName: `${reportHeaders.reportName}-check`,
    //     ReportTitle: reportHeaders.reportTitle,
    //     TrxJSonString: JSON.stringify(jsonString),
    //     TrxXmlString: xmlData,
    //   },
    // };
    trxDataWrapper = jsonString;
  }

  return trxDataWrapper;
}

function IsEmpty(testData: TrxData): boolean {
  return testData.TestRun.TestDefinitions ? false : true;
}

export async function readTrxFile(filePath: string): Promise<string> {
  return await promises.readFile(filePath, "utf8");
}

export function areThereAnyFailingTests(
  trxJsonReports: TrxDataWrapper[]
): boolean {
  for (const trxData of trxJsonReports) {
    if (trxData.TrxData.TestRun.ResultSummary._outcome === "Failed") {
      return true;
    }
  }
  return false;
}

function getReportHeaders(data: TrxData): {
  reportName: string;
  reportTitle: string;
} {
  let reportTitle = "";
  let reportName = "";
  const isEmpty = IsEmpty(data);

  if (isEmpty) {
    reportTitle = data.TestRun.ResultSummary.RunInfos.RunInfo._computerName;
    reportName =
      data.TestRun.ResultSummary.RunInfos.RunInfo._computerName.toUpperCase();
  } else {
    const unittests = data.TestRun?.TestDefinitions?.UnitTest;

    const storage = getAssemblyName(unittests);

    const dllName = storage.split("/").pop();

    if (dllName) {
      reportTitle = dllName.replace(".dll", "").toUpperCase().replace(".", " ");
      reportName = dllName.replace(".dll", "").toUpperCase();
    }
  }

  return { reportName, reportTitle };
}

function getAssemblyName(unittests: UnitTest[]): string {
  if (Array.isArray(unittests)) {
    // core.debug('Its an array')
    return unittests[0]._storage;
  } else {
    const ut = unittests as UnitTest;
    if (ut) {
      // core.debug(`Its not an array: ${ut._storage}`)
      return ut._storage;
    } else {
      return "NOT FOUND";
    }
  }
}
