#!/usr/bin/env node
const fs = require('fs');
const { Transform } = require('stream');
const { argv } = require('yargs');
const split = require('split');

const [file] = argv._;
const { C: context, l: line, h: help } = argv;

if (help) {
  process.stdout.write('Usage : liner -l <lineNumber> -C <numberOfLinesToShow> <file>\n');
  process.exit(0);
}

if (!line) {
  process.stderr.write('A line is required. Usage : liner -l <lineNumber> <file>\n');
  process.exit(1);
}

class Liner extends Transform {
  constructor(options) {
    super(options);
    this.targetLine = options.line;
    this.line = 0;
    this.context = Math.round(options.context / 2) || 0;
  }
  _transform(chunk, encoding, callback) {
    this.line = this.line + 1;
    if (
      this.line >= this.targetLine - this.context &&
      this.line <= this.targetLine + this.context
    ) {
      this.push(`${chunk}\n`);
    }
    if (this.line >= this.targetLine + this.context) {
      this.end();
    }
    callback();
  }
}

fs
  .createReadStream(file, { encoding: 'utf8' })
  .pipe(split())
  .pipe(new Liner({ line, context }))
  .pipe(process.stdout);
