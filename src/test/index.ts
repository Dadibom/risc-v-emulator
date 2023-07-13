import { testArrayFunction, testFunction } from "./testHarness";
import { Parser, parserTestCases } from "../parser";

const parser = new Parser();
testArrayFunction(parser.parse, parserTestCases);