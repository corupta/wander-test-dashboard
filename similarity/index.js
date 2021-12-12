const Jimp = require("jimp");
const path = require('path');

const sampleDrawing = path.join(__dirname, '..', 'sampleData', 'sampleDrawing.png');
const fakeDrawing = path.join(__dirname, '..', 'sampleData', 'fakeDrawing.png');
const fakeDrawing2 = path.join(__dirname, '..', 'sampleData', 'fakeDrawing2.png');
const sampleSpell = path.join(__dirname, '..', 'sampleData', 'sampleSpell.png');

// refer to https://www.codedrome.com/comparing-images-node-jimp/
const checkSimilarity = async () => {
  const drawing = await Jimp.read(sampleDrawing);
  const fake = await Jimp.read(fakeDrawing);
  const fake2 = await Jimp.read(fakeDrawing2);
  const spell = await Jimp.read(sampleSpell);

  console.log("Images compared to sampleSpell.png\n=========================================");
  console.log(`hash (base 64) ${spell.hash()}`);
  console.log(`hash (binary)  ${spell.hash(2)}`);
  console.log(`distance       ${Jimp.distance(spell, spell)}`);
  console.log(`diff.percent   ${Jimp.diff(spell, spell).percent}\n`);

  console.log("sampleDrawing.png\n================");
  console.log(`hash (base 64) ${drawing.hash()}`);
  console.log(`hash (binary)  ${drawing.hash(2)}`);
  console.log(`distance       ${Jimp.distance(spell, drawing)}`);
  console.log(`diff.percent   ${Jimp.diff(spell, drawing).percent}\n`);

  console.log("fakeDrawing.png\n================");
  console.log(`hash (base 64) ${fake.hash()}`);
  console.log(`hash (binary)  ${fake.hash(2)}`);
  console.log(`distance       ${Jimp.distance(spell, fake)}`);
  console.log(`diff.percent   ${Jimp.diff(spell, fake).percent}\n`);

  fake2.r
  console.log("fakeDrawing2.png\n================");
  console.log(`hash (base 64) ${fake2.hash()}`);
  console.log(`hash (binary)  ${fake2.hash(2)}`);
  console.log(`distance       ${Jimp.distance(spell, fake2)}`);
  console.log(`diff.percent   ${Jimp.diff(spell, fake2).percent}\n`);

}

checkSimilarity().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
})
