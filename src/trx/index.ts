import { glob } from "glob";
import fs from "fs";
import { TrxData, TrxDataWrapper, UnitTest } from "./types";
import { promises } from "fs";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const GLOB_PATTERN = process.env["GLOB_PATTERN"] ?? "**/*.trx";
const GLOB_IGNORE = process.env["GLOB_IGNORE"] ?? "node_modules/**";

async function getTrxFiles() {
  const trxFiles = await glob(GLOB_PATTERN, { ignore: GLOB_IGNORE });
  console.log(GLOB_PATTERN, trxFiles);
  return trxFiles;
}

export async function getTrxTestResults() {
  const tapFiles = await getTrxFiles();

  return await Promise.all(
    tapFiles.map(async (file) => {
      const tapData = fs.readFileSync(file).toString();
      const result = await transformTrxToJson(tapData);
      return {
        name: file,
        results: result,
      };
    })
  );
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

export async function transformAllTrxToJson(
  trxFiles: string[]
): Promise<TrxDataWrapper[]> {
  const transformedTrxReports: TrxDataWrapper[] = [];
  for (const trx of trxFiles) {
    transformedTrxReports.push(await transformTrxToJson(trx));
  }

  return transformedTrxReports;
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
