import { glob } from "glob";
import fs from "fs";
import { promises } from "fs";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { Result } from "../types";

const GLOB_PATTERN = process.env["GLOB_PATTERN"] ?? "**/*.{trx,tap,junit.xml}";
const GLOB_IGNORE = process.env["GLOB_IGNORE"] ?? "node_modules/**";

async function getFileNames(): Promise<string[]> {
  return await glob(GLOB_PATTERN, { ignore: GLOB_IGNORE }).then((fileNames) =>
    fileNames.filter((fileName) => fileName.endsWith(".junit.xml"))
  );
}

export async function getJUnitTestResults(): Promise<
  { name: string; results: Result[] }[]
> {
  const junitFiles = await getFileNames();

  return await Promise.all(
    junitFiles.map(async (fileName) => {
      const xmlData = fs.readFileSync(fileName).toString();

      const result = await transformXmlToJson(xmlData);
      console.log(JSON.stringify(result, null, 2));
      return { name: fileName, results: [] };
      // return {
      //   name: fileName,
      //   results: Object.values(denormalize(result)).map(junitToTap),
      // };
    })
  );
}

export async function transformXmlToJson(xmlData: string): Promise<any> {
  let junitDataWrapper: any;

  const options = {
    ignoreAttributes: false,
    // attributeNamePrefix: "_",
    // // attrNodeName: '@', //default is 'false'
    // textNodeName: "#text",
    // ignoreAttributes: false,
    // ignoreNameSpace: false,
    // allowBooleanAttributes: true,
    // parseNodeValue: true,
    // parseAttributeValue: true,
    // trimValues: true,
    // format: true,
    // indentBy: "  ",
    // supressEmptyNode: false,
    // rootNodeName: "element",
    // cdataTagName: "__cdata", //default is 'false'
    // cdataPositionChar: "\\c",
    // parseTrueNumberOnly: false,
    // arrayMode: false, //"strict"
    // stopNodes: ["parse-me-as-string"],
  };

  const xmlParser = new XMLParser(options);
  const isValid = XMLValidator.validate(xmlData, {
    allowBooleanAttributes: true,
  });
  if (isValid === true) {
    const jsonString = xmlParser.parse(xmlData, true);
    junitDataWrapper = jsonString;
  }

  return junitDataWrapper;
}

export async function readFile(filePath: string): Promise<string> {
  return await promises.readFile(filePath, "utf8");
}

function junitToTap(r: any) {
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
