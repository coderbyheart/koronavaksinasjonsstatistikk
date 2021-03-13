import * as fs from "fs";
import * as path from "path";

const population = 5_391_369; // https://www.ssb.no/befolkning/faktaside/befolkningen
const children = 1_118_608; // https://www.ssb.no/a/barnogunge/2020/bef/
const herdImmunity = 0.8; // https://twitter.com/IDF/status/1369952743889195009
const stats = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), `99119.json`), "utf-8")
);

const [date, vaccinatedWithDose1, vaccinatedWithDose2] = stats[
  stats.length - 1
];

let vaccinatedDose1 = 0;
let vaccinatedDose2 = 0;
for (let i = stats.length - 1; i > stats.length - 8; i--) {
  const [_, __, ___, dose1, dose2] = stats[i];
  vaccinatedDose1 += dose1;
  vaccinatedDose2 += dose2;
}
const dose1WeekAverage = Math.floor(vaccinatedDose1 / 7);
const daysToHerdimmunity = Math.ceil(
  (population * herdImmunity - vaccinatedWithDose1) / dose1WeekAverage
);

const f = new Intl.NumberFormat('no-NO').format

console.log('\n')
console.log(`Population: ${f(population)}  `);
console.log(`Children: ${f(children)}  `);
console.log(`Herd immunity: ${herdImmunity * 100}%  \n`);
console.log(`## ${date}\n`);
console.log("### Dose 1\n");
console.log(
  `Vaccinated: ${f(vaccinatedWithDose1)} (${(
    (vaccinatedWithDose1 / population) *
    100
  ).toFixed(2)}%)  `
);
console.log(`7 day average: ${f(dose1WeekAverage)}\n`);
console.log(
  `Herd immunity reached in ${daysToHerdimmunity} days on ${new Date(
    Date.now() + daysToHerdimmunity * 24 * 60 * 60 * 1000
  )
    .toLocaleDateString('no-NO')}  `
);
console.log(
  `${daysToHerdimmunity} * ${f(dose1WeekAverage)} + ${f(vaccinatedWithDose1)} = ${
    f(daysToHerdimmunity * dose1WeekAverage + vaccinatedWithDose1)
  } >= ${f(population)} * ${herdImmunity} = ${f(Math.ceil(population * herdImmunity))}\n`
);
console.log("### Dose 2\n");
console.log(
  `Vaccinated: ${f(vaccinatedWithDose2)} (${(
    (vaccinatedWithDose2 / population) *
    100
  ).toFixed(2)}%)  `
);
console.log(`7 day average: ${f(Math.floor(vaccinatedDose2 / 7))}\n`);
