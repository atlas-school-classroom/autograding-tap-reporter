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
      // console.log(JSON.stringify(denormalize(result), null, 2));
      // return { name: fileName, results: [] };
      return {
        name: fileName,
        results: denormalize(result).map(junitToTap),
      };
    })
  );
}

export async function transformXmlToJson(xmlData: string): Promise<any> {
  let junitDataWrapper: any;

  const options = {
    ignoreAttributes: false,
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
    ok: r?.failure !== "",
    name: r["@_name"],
    id: r["@_name"], //r?.Execution?._executionId,
    buffered: false,
    tapError: null,
    skip: false,
    todo: false,
    previous: null,
    plan: null,
    diag: r["system-out"], //r?.Execution?.Output?.ErrorInfo,
    time: r["@_time"],
    fullname: r["@_name"],
    closingTestPoint: false,
  };
}

function denormalize(result: any) {
  let testCases = result.testsuites.testsuite.testcase;
  if (!Array.isArray(testCases)) {
    testCases = [testCases];
  }
  return testCases;
  // //@ts-ignore
  // const unitTestResults = result["TestRun"]["Results"][
  //   "UnitTestResult" //@ts-ignore
  // ].reduce((acc, result) => {
  //   //@ts-ignore
  //   acc[result["_executionId"]] = result;
  //   return acc;
  // }, {});
  // //@ts-ignore
  // const unitTest = result["TestRun"]["TestDefinitions"][
  //   "UnitTest" //@ts-ignore
  // ].reduce((acc, result) => {
  //   //@ts-ignore
  //   acc[result["_id"]] = result;
  //   const resultId = result["Execution"]["_id"];
  //   acc[result["_id"]]["Execution"] = unitTestResults[resultId];
  //   return acc;
  // }, {});
  // return unitTest;
}
