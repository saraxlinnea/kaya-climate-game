import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { SiteFooter } from './SiteFooter'

export function Methodology() {
  usePageTitle('Methods: Kaya Climate')
  return (
    <div className="app-shell">
      <BrandHeader subtitle="Where the numbers come from, and what they are not meant to prove." />

      <article className="panel methods-doc">
        <h1 className="panel-title">Methodology</h1>
        <p className="panel-note">
          This page is the short version for readers. Full scoring rules live in the repository files{' '}
          <code>SCORING.md</code> and <code>DATA_SOURCES.md</code>.
        </p>

        <h2>The Kaya identity</h2>
        <p className="kaya-equation" aria-label="Kaya identity">
          CO<sub>2</sub> = P × (GDP/P) × (E/GDP) × (CO<sub>2</sub>/E)
        </p>
        <p>
          Yearly carbon dioxide from a country can be written as four parts multiplied together:
          how many people live there, how much money each person has on average, how much energy the
          economy uses for that money, and how much carbon dioxide that energy releases. The parts
          work together. No single bar on a chart causes the whole result alone. Groups like the IPCC
          and the IEA use this kind of accounting to explain what changed. It helps explain the past.
          It does not predict the future.
        </p>

        <h2>The equation is not the Champion score</h2>
        <p>
          The identity is a normal way to organize the data. The Kaya Champion score on this site is
          a separate ranking we made for the site. It mixes how emissions, income, energy intensity,
          and carbon intensity changed from 2000 to the latest year. It is not an official IPCC or IEA
          number. Charts show what moved. The score answers a narrower question: who improved most on
          our rules for that time window.
        </p>

        <h2>Change over time versus levels today</h2>
        <p>
          The Champion score rewards rates of change. It asks whether a country cut total emissions,
          raised income per person, and used energy more cleanly. It does not reward being already
          clean, or emitting little per person today.
        </p>
        <p>
          That difference matters when you compare places like the United States and Canada. From
          2000 to 2022, U.S. emissions inside its borders fell by about 16 percent, while Canada’s
          fell by about 3 percent, with similar income growth. On our change-over-time score, the
          United States ranks higher. Canada can still look higher on emissions per person. Both can
          be true. They answer different questions. The explorer and compare pages show today’s levels
          (per person and carbon per dollar of GDP) next to the change-over-time numbers.
        </p>

        <h2>Data</h2>
        <p>
          The main source is Our World in Data’s CO₂ data file, which draws on the Global Carbon
          Project, the Energy Institute, World Bank, and United Nations population estimates. Rows are
          countries with ISO3 codes. Regional totals are dropped. Missing years are left blank.
        </p>

        <h2>Production versus consumption emissions</h2>
        <p>
          Charts and the Kaya identity use territorial emissions: carbon dioxide from fuels and
          processes inside a country’s borders. Our World in Data also publishes consumption-based
          emissions, which move some emissions to the country that buys the goods. When that series
          exists, the explorer draws both lines and adds a short note on the gap.
        </p>
        <p>
          A falling territorial line can mean cleaner energy, or industry moving abroad, or both.
          Consumption emissions are a check on that question. They do not change the Champion score,
          which stays territorial, and they are not a full world trade model.
        </p>

        <h2>How the Champion score is built</h2>
        <p>
          The window is 2000 through the latest year at or after 2018 (currently 2022 for eligible
          countries). Countries need at least one million people and five million tonnes of CO₂ in
          2000. The score rewards lower total CO₂, higher GDP per person, lower energy intensity, and
          lower carbon intensity, with fixed weights 30 / 25 / 20 / 25. It is not a ranking of lowest
          absolute emissions, current cleanliness, or historical responsibility.
        </p>

        <h2>Other indicators people use</h2>
        <ul>
          <li>Emissions per person, for fairness and lifestyle scale</li>
          <li>Carbon intensity of GDP, for economy-wide efficiency</li>
          <li>Consumption or footprint emissions, for trade-adjusted responsibility</li>
          <li>Kaya-style or LMDI decomposition, for attributing change over time</li>
        </ul>
        <p>
          Indices such as the Environmental Performance Index, Climate Action Tracker ratings, and
          the UNEP Emissions Gap Report are useful elsewhere. They need other datasets and are not
          loaded here.
        </p>

        <h2>Outside reading on country pages</h2>
        <p>
          Country pages link to Our World in Data, Ember, and selected Carbon Brief profiles. Short
          notes are tied to those sources. We do not scrape third-party articles into the app.
        </p>

        <h2>The combat game</h2>
        <p>
          The game is simplified on purpose so you can learn by playing. Energy and carbon intensity
          bars start from the country’s levels compared with other countries. Each turn also adds the
          usual growth in population and prosperity from that country’s history. Actions get weaker if
          you repeat them. After a run, you can compare your path to that country’s real record from
          2000 to the latest year. Population policies appear with hard tradeoffs. They are not
          recommended solutions.
        </p>

        <h2>Limitations</h2>
        <ul>
          <li>
            Production-based CO₂ drives the score and the main “what changed” story. Consumption
            overlays appear when Our World in Data provides them.
          </li>
          <li>
            Primary-energy carbon intensity is the Kaya factor. Ember’s electricity intensity (grams
            of CO₂-equivalent per kilowatt-hour) is optional and used for electric-vehicle payoffs in
            combat when the grid matters.
          </li>
          <li>Score clip bounds are product choices for version 1, not physical constants.</li>
          <li>
            GDP series often lag energy and CO₂, so the latest complete Kaya year may trail the
            calendar year.
          </li>
          <li>
            The world map uses coarse outlines. Hong Kong and Singapore appear as markers when they
            have scores.
          </li>
        </ul>

        <p className="methods-links">
          <Link className="country-link" to="/country/USA">
            United States explorer
          </Link>
          {' · '}
          <Link className="country-link" to="/compare?a=USA&b=CAN">
            United States and Canada
          </Link>
          {' · '}
          <Link className="country-link" to="/rankings">
            Leaderboard
          </Link>
        </p>
      </article>

      <SiteFooter />
    </div>
  )
}
