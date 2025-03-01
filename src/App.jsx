import { useState } from "react";
import { Button, FormControlLabel, Checkbox, TextField } from "@mui/material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
/* eslint-disable react/prop-types */

const App = () => {
  const [rp, setRp] = useState(575);
  const [totRp, setTotRp] = useState(0);
  const [bonusOnly, setBonusOnly] = useState(false);
  const [curiousVisible, setCuriousVisibility] = useState(false);

  const handleChange = (e) => {
    const { type, value, checked} = e.target;
    if (type === "checkbox") {
      setBonusOnly(checked);
    } else if (type === "number") {
      const max = 9999999;
      if (value < max) {
        setRp(value);
      }
      else {
        setRp(max);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const response = document.querySelector(".response");
    response.innerHTML = "";

    if (rp < 1) {
      return;
    }

    const purchaseOptions = [
      { cost: 429.99, rpv: 60200 },
      { cost: 244.99, rpv: 33500 },
      { cost: 99.99, rpv: 13500 },
      { cost: 49.99, rpv: 6500 },
      { cost: 34.99, rpv: 4500 },
      { cost: 21.99, rpv: 2800 },
      { cost: 10.99, rpv: 1380 },
    ];

    if (!bonusOnly) {
      purchaseOptions.push({ cost: 4.99, rpv: 575 });
    }

    const { minCost, purchases, totRp } = minCostToGetRPV(purchaseOptions, rp);

    response.innerHTML += `<p>Minimum USD: $${minCost}</p>`;
    response.innerHTML += `<p>Total RP: ${totRp} ${
      totRp - rp === 0 ? "" : `(${totRp - rp} excess RP)`
    }</p>`;

    const purchaseSummary = purchases.reduce((acc, { cost }) => {
      acc[cost] = (acc[cost] || 0) + 1;
      return acc;
    }, {});

    const purchaseSummaryString = Object.entries(purchaseSummary)
      .map(([cost, count]) => `${count}x $${cost}`)
      .join(", ");

    response.innerHTML += `<p><strong>Purchases:</strong> ${purchaseSummaryString}</p>`;
    setCuriousVisibility(true);
    setTotRp(totRp);
  };

  const CuriousList = () => {
    return (
      <div id="curiousList">
        <p>
          <strong>
            With {totRp} RP you can get (assume mutual exclusion):
          </strong>
        </p>
        {totRp >= 975 && (
          <p>
            {Math.floor(totRp / 975)} common skin{totRp >= 975 * 2 ? "s" : ""}
          </p>
        )}
        {totRp >= 1350 && (
          <p>
            {Math.floor(totRp / 1350)} epic skin{totRp >= 1350 * 2 ? "s" : ""}
          </p>
        )}
        {totRp >= 1650 && (
          <p>
            {Math.floor(totRp / 1650)} battle pass
            {totRp >= 1650 * 2 ? "es" : ""}
          </p>
        )}
        {totRp >= 1820 && (
          <p>
            {Math.floor(totRp / 1820)} legendary skin
            {totRp >= 1820 * 2 ? "s" : ""}
          </p>
        )}
        {totRp >= 3250 && (
          <p>
            {Math.floor(totRp / 3250)} ultimate skin
            {totRp >= 3250 * 2 ? "s" : ""}
            {totRp >= 3250 * 7 &&
              " (you can buy all 7 released ultimate skins as of Dec 2024)"}
          </p>
        )}
        {totRp >= 400 && (
          <p>
            {Math.floor(totRp / 400)} ancient spark{totRp >= 800 ? "s" : ""}{" "}
            (sanctum roll{totRp >= 800 ? "s" : ""})
          </p>
        )}
        {totRp >= 128850 && <p>Buy all currently released champions.</p>}
        {totRp >= 32000 && (
          <p>
            Do at least 80 sanctum rolls, guaranteeing the Arcane Fractured Jinx
            skin!
          </p>
        )}
        {totRp >= 59260 && (
          <p>
            Buy the Signature Immortalized Legend Collection in honor of Faker!
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1>RP (Riot Points) Calculator</h1>
      <h3>
        Calculate the minimum amount of USD required to get your desired amount
        of RP. Calculations include bulk discounts.
      </h3>
      <form onSubmit={handleSubmit}>
        <FormControlLabel
          control={
            <TextField
              size="small"
              variant="standard"
              type="number"
              name="rp"
              min="1"
              max="9999999"
              value={rp}
              label="RP"
              onChange={handleChange}
            />
          }
        />
        <Button size="small" variant="contained" type="submit">
          Convert
        </Button>
        <FormControlLabel
          className="checkbox"
          label="Only purchases with bonus"
          control={<Checkbox size="small" type="checkbox" name="bonus" />}
          onChange={handleChange}
        />
        <div className="response"></div>
        {curiousVisible ? (
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              sx={{ bgcolor: "#e2e8f0" , marginTop: "20px"}}
            >
              What can I do with this much RP?
            </AccordionSummary>
            <AccordionDetails>
              <CuriousList />
            </AccordionDetails>
          </Accordion>
        ) : null}
      </form>
    </div>
  );
};

function minCostToGetRPV(purchaseOptions, targetRPV) {
  const memo = {};

  function dp(rpvLeft) {
    if (rpvLeft in memo) return memo[rpvLeft];
    if (rpvLeft <= 0) return { cost: 0, purchases: [] };

    let minCost = Infinity;
    let optimalPurchases = [];

    for (const { cost, rpv } of purchaseOptions) {
      const result = dp(rpvLeft - rpv);
      const currentCost = result.cost + cost;

      if (currentCost < minCost) {
        minCost = currentCost;
        optimalPurchases = [...result.purchases, { cost, rpv }];
      }
    }

    memo[rpvLeft] = { cost: minCost, purchases: optimalPurchases };
    return memo[rpvLeft];
  }

  const result = dp(targetRPV);
  const totalRPV = result.purchases.reduce((acc, { rpv }) => acc + rpv, 0);
  return {
    minCost: result.cost === Infinity ? -1 : result.cost.toFixed(2),
    purchases: result.purchases,
    totRp: totalRPV,
  };
}

export default App;
