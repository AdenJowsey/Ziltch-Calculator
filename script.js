const dictionary = new Map();
dictionary.set(1, [318.2522681098825, 0.6666666666666666, 450]);
dictionary.set(2, [287.4916234186953, 0.4444444444444446, 600]);
dictionary.set(3, [331.68246283297094, 0.2777777777777776, 1150]);
dictionary.set(4, [426.86780861461256, 0.15740740740740797, 2700]);
dictionary.set(5, [614.0850390312266, 0.07716049382716063, 7950]);
dictionary.set(6, [887.796536874893, 0.030864197530863523, 28750]);

function getAllScoringCombinations(dice) {
  const results = new Set();

  function getCounts(diceArray) {
    const counts = Array(7).fill(0);
    diceArray.forEach((d) => counts[d]++);
    return counts;
  }

  function resultKey(score, remainingCount) {
    return `${score}:${remainingCount}`;
  }

  function explore(remainingDice, currentScore) {
    const key = resultKey(currentScore, remainingDice.length);
    results.add(JSON.stringify([currentScore, remainingDice]));

    if (remainingDice.length === 0) return;

    const counts = getCounts(remainingDice);

    const tried = new Set();

    if (counts[1] > 0 && counts[1] < 3) {
      for (let take = 1; take <= counts[1]; take++) {
        const tryKey = `1s:${take}`;
        if (!tried.has(tryKey)) {
          tried.add(tryKey);
          const newDice = [...remainingDice];
          let removed = 0;
          for (let i = 0; i < newDice.length && removed < take; i++) {
            if (newDice[i] === 1) {
              newDice.splice(i, 1);
              i--;
              removed++;
            }
          }
          explore(newDice, currentScore + take * 100);
        }
      }
    }

    if (counts[5] > 0 && counts[5] < 3) {
      for (let take = 1; take <= counts[5]; take++) {
        const tryKey = `5s:${take}`;
        if (!tried.has(tryKey)) {
          tried.add(tryKey);
          const newDice = [...remainingDice];
          let removed = 0;
          for (let i = 0; i < newDice.length && removed < take; i++) {
            if (newDice[i] === 5) {
              newDice.splice(i, 1);
              i--;
              removed++;
            }
          }
          explore(newDice, currentScore + take * 50);
        }
      }
    }

    for (let value = 1; value <= 6; value++) {
      const count = counts[value];
      if (count < 3) continue;

      const baseScore = value === 1 ? 1000 : value * 100;

      const tryKey3 = `${value}x3`;
      if (!tried.has(tryKey3)) {
        tried.add(tryKey3);
        const newDice = removeDice(remainingDice, value, 3);
        explore(newDice, currentScore + baseScore);
      }

      if (count >= 4) {
        const tryKey4 = `${value}x4`;
        if (!tried.has(tryKey4)) {
          tried.add(tryKey4);
          const newDice = removeDice(remainingDice, value, 4);
          explore(newDice, currentScore + baseScore * 2);
        }
      }

      if (count >= 5) {
        const tryKey5 = `${value}x5`;
        if (!tried.has(tryKey5)) {
          tried.add(tryKey5);
          const newDice = removeDice(remainingDice, value, 5);
          explore(newDice, currentScore + baseScore * 4);
        }
      }

      if (count === 6) {
        const tryKey6 = `${value}x6`;
        if (!tried.has(tryKey6)) {
          tried.add(tryKey6);
          const newDice = removeDice(remainingDice, value, 6);
          explore(newDice, currentScore + baseScore * 8);
        }
      }
    }

    if (
      remainingDice.length >= 5 &&
      counts[1] >= 1 &&
      counts[2] >= 1 &&
      counts[3] >= 1 &&
      counts[4] >= 1 &&
      counts[5] >= 1
    ) {
      const tryKey = "straight5a";
      if (!tried.has(tryKey)) {
        tried.add(tryKey);
        let newDice = [...remainingDice];
        [1, 2, 3, 4, 5].forEach((val) => {
          const idx = newDice.indexOf(val);
          if (idx > -1) newDice.splice(idx, 1);
        });
        explore(newDice, currentScore + 1000);
      }
    }

    if (
      remainingDice.length >= 5 &&
      counts[2] >= 1 &&
      counts[3] >= 1 &&
      counts[4] >= 1 &&
      counts[5] >= 1 &&
      counts[6] >= 1
    ) {
      const tryKey = "straight5b";
      if (!tried.has(tryKey)) {
        tried.add(tryKey);
        let newDice = [...remainingDice];
        [2, 3, 4, 5, 6].forEach((val) => {
          const idx = newDice.indexOf(val);
          if (idx > -1) newDice.splice(idx, 1);
        });
        explore(newDice, currentScore + 1000);
      }
    }

    if (
      remainingDice.length === 6 &&
      counts[1] === 1 &&
      counts[2] === 1 &&
      counts[3] === 1 &&
      counts[4] === 1 &&
      counts[5] === 1 &&
      counts[6] === 1
    ) {
      const tryKey = "straight6";
      if (!tried.has(tryKey)) {
        tried.add(tryKey);
        explore([], currentScore + 2000);
      }
    }
  }

  function removeDice(diceArray, value, count) {
    const newDice = [...diceArray];
    let removed = 0;
    for (let i = 0; i < newDice.length && removed < count; i++) {
      if (newDice[i] === value) {
        newDice.splice(i, 1);
        i--;
        removed++;
      }
    }
    return newDice;
  }

  explore(dice, 0);

  return Array.from(results)
    .map((str) => JSON.parse(str))
    .filter(([score]) => score > 0)
    .sort((a, b) => b[0] - a[0]);
}

function calculate(diceSet, currentScore = 0) {
  const scoringOptions = getAllScoringCombinations(diceSet);
  if (scoringOptions.length === 0) {
    return "No scoring combinations available.";
  } else {
    const expectationOptions = scoringOptions
      .map(([score, remaining]) => {
        const key = remaining.length;
        const subExpectation =
          remaining.length === 0 ? dictionary.get(6) : dictionary.get(key);
        return [
          score +
            Math.max(
              subExpectation[0] - (score + currentScore) * subExpectation[1],
              0
            ),
          remaining,
          subExpectation[0] - (score + currentScore) * subExpectation[1] > 0,
          diceDifferenceByCount(diceSet, remaining).join(","),
          score,
        ];
      })
      .sort((a, b) => b[0] - a[0]);
    return `Take ${expectationOptions[0][3]} (+${expectationOptions[0][4]} Ex:+${Math.round(
      expectationOptions[0][0]
    )}) and ${expectationOptions[0][2] ? "continue rolling" : "bank"}.`;
  }
}

function diceDifferenceByCount(diceA, diceB) {
  const countsA = Array(7).fill(0);
  const countsB = Array(7).fill(0);

  diceA.forEach((d) => countsA[d]++);
  diceB.forEach((d) => countsB[d]++);

  const result = [];
  for (let value = 1; value <= 6; value++) {
    const remaining = Math.max(0, countsA[value] - countsB[value]);
    for (let i = 0; i < remaining; i++) {
      result.push(value);
    }
  }

  return result.sort((a, b) => a - b);
}

globalThis.addEventListener("DOMContentLoaded", () => {
  // State
  let selectedDice = [];
  let currentScore = 0;

  // DOM Elements
  const diceButtons = document.querySelectorAll(".dice-button");
  const selectedDiceDisplay = document.getElementById("selectedDice");
  const diceCountDisplay = document.getElementById("diceCount");
  const clearButton = document.getElementById("clearButton");
  const scoreInput = document.getElementById("scoreInput");
  const increaseScoreBtn = document.getElementById("increaseScore");
  const decreaseScoreBtn = document.getElementById("decreaseScore");
  const calculateButton = document.getElementById("calculateButton");
  const resultsSection = document.getElementById("resultsSection");
  const resultsContainer = document.getElementById("resultsContainer");

  // Initialize
  init();

  function init() {
    // Dice button listeners
    diceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = parseInt(button.dataset.value);
        handleDiceClick(value);
      });
    });

    // Clear button
    clearButton.addEventListener("click", clearAllDice);

    // Score adjustment buttons
    increaseScoreBtn.addEventListener("click", () => adjustScore(50));
    decreaseScoreBtn.addEventListener("click", () => adjustScore(-50));

    // Score input direct change
    scoreInput.addEventListener("input", (e) => {
      currentScore = Math.max(0, parseInt(e.target.value) || 0);
      updateScoreDisplay();
    });

    // Calculate button
    calculateButton.addEventListener("click", handleCalculate);

    updateUI();
  }

  // Handle dice selection - now allows duplicates
  function handleDiceClick(value) {
    if (selectedDice.length < 6) {
      // Always add the die (allows duplicates)
      selectedDice.push(value);
      updateUI();
    }
  }

  // Clear all dice
  function clearAllDice() {
    selectedDice = [];
    updateUI();
  }

  // Adjust score by amount
  function adjustScore(amount) {
    currentScore = Math.max(0, currentScore + amount);
    updateScoreDisplay();
  }

  // Update score display
  function updateScoreDisplay() {
    scoreInput.value = currentScore;
    decreaseScoreBtn.disabled = currentScore < 50;
  }

  // Update UI
  function updateUI() {
    // Update selected dice display
    if (selectedDice.length === 0) {
      selectedDiceDisplay.innerHTML =
        '<span class="empty-state">No dice selected</span>';
    } else {
      selectedDiceDisplay.innerHTML = selectedDice
        .map(
          (die, index) => `
                <div class="selected-die" onclick="removeDie(${index})" style="cursor: pointer;" title="Click to remove">
                    ${die}
                </div>
            `
        )
        .join("");
    }

    // Update dice count
    diceCountDisplay.textContent = `${selectedDice.length} / 6 dice selected`;

    // Enable/disable calculate button
    calculateButton.disabled = selectedDice.length === 0;

    // Update score button states
    decreaseScoreBtn.disabled = currentScore < 50;

    // Update dice button states - disable all if at limit
    diceButtons.forEach((button) => {
      if (selectedDice.length >= 6) {
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
      } else {
        button.style.opacity = "1";
        button.style.cursor = "pointer";
      }
    });
  }

  // Remove a specific die by index
  function removeDie(index) {
    selectedDice.splice(index, 1);
    updateUI();
  }

  // Handle calculate button
  function handleCalculate() {
    if (selectedDice.length === 0) return;

    // Call the calculate function (returns a string)
    const resultString = calculate(selectedDice, currentScore);

    // Display results
    displayResults(resultString);
  }

  // Display results
  function displayResults(resultString) {
    resultsSection.classList.add("visible");

    // Parse the result string and create result items
    // For now, just display the string
    resultsContainer.innerHTML = `
        <div class="result-item">
            <div class="result-text" style="white-space: pre-line;">${resultString}</div>
        </div>
    `;

    const addButton = document.createElement('button');
    const points = Number.parseInt(resultString.match(/\+\d+/)[0].substring(1));
    addButton.textContent = "Add Score";
    addButton.classList.add("add-score-button");
    addButton.addEventListener("click", () => handleAddScore(points));
    resultsContainer.querySelector(".result-item").appendChild(addButton);

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Add score handler (to be called by dynamically created buttons)
  function handleAddScore(points) {
    currentScore += points;
    updateScoreDisplay();

    // Clear current dice and set to remaining
    clearAllDice();

    // If there are remaining dice, we'd need to handle that
    // For now, just clear everything

    // Hide results
    resultsSection.classList.remove("visible");

  }
});
