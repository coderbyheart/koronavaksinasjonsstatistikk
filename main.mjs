import * as fs from "fs";
import * as https from "https";
import * as path from "path";

const population = 5_391_369; // https://www.ssb.no/befolkning/faktaside/befolkningen
const herdImmunity = 0.95; // It's not known: https://www.who.int/news-room/q-a-detail/herd-immunity-lockdowns-and-covid-19
const day = new Date().toISOString().substr(0, 10);
const f = path.resolve(process.cwd(), `${day}.json`);
const stats = await (async () => {
  try {
    return JSON.parse(fs.readFileSync(f, "utf-8"));
  } catch {
    return new Promise((resolve, reject) => {
      let rawData = "";
      https
        .get("https://www.fhi.no/api/chartdata/api/99119", (res) => {
          res.on("data", (chunk) => {
            rawData += chunk;
          });
          res.on("end", () => {
            try {
              const stats = JSON.parse(rawData);
              fs.writeFileSync(f, JSON.stringify(stats, null, 2), "utf-8");
              return resolve(stats);
            } catch (e) {
              return reject(e);
            }
          });
        })
        .on("error", (e) => {
          return reject(e);
        });
    });
  }
})();

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

console.log("\n\n");
console.log(`Population: ${population}  `);
console.log(`Herd immunity: ${herdImmunity * 100}%  \n`);
console.log(`## ${date}\n`);
console.log("### Dose 1\n");
console.log(
  `Vaccinated: ${vaccinatedWithDose1} (${(
    (vaccinatedWithDose1 / population) *
    100
  ).toFixed(2)}%)  `
);
console.log(`7 day average: ${dose1WeekAverage}\n`);
console.log(
  `Herd immunity reached in ${daysToHerdimmunity} days: ${new Date(
    Date.now() + daysToHerdimmunity * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .substr(0, 10)}  `
);
console.log(
  `${daysToHerdimmunity} * ${dose1WeekAverage} + ${vaccinatedWithDose1} = ${
    daysToHerdimmunity * dose1WeekAverage + vaccinatedWithDose1
  } >= ${population} * ${herdImmunity}\n`
);
console.log("### Dose 2\n");
console.log(
  `Vaccinated: ${vaccinatedWithDose2} (${(
    (vaccinatedWithDose2 / population) *
    100
  ).toFixed(2)}%)  `
);
console.log(`7 day average: ${Math.floor(vaccinatedDose2 / 7)}\n`);
console.log("---");
console.log("Last update:", new Date().toISOString());
