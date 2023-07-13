"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testHarness_1 = require("./testHarness");
const parser_1 = require("../parser");
const parser = new parser_1.Parser();
(0, testHarness_1.testArrayFunction)(parser.parse, parser_1.parserTestCases);
