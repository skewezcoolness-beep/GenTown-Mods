// Ages Mod — Interactive Yes/No Choice Questions with Unlocks

(function() {

    const AGE_ORDER = [
        "Stone Age",
        "Bronze Age",
        "Iron Age",
        "Classical Age",
        "Medieval Age",
        "Renaissance",
        "Industrial Age",
        "Modern Age",
        "Information Age"
    ];

    // Initialize town ages
    Mod.event("initializeAges", {
        daily: true,
        once: true,
        target: { reg: "town", all: true },
        func: (subject, town) => {
            if (!town.age) town.age = "Stone Age";
        }
    });

    // Function to advance town age
    function advanceAge(town, nextAge) {
        town.age = nextAge;
        happen("Chronicle", null, town, { text: `${town.name} has advanced to the ${nextAge}!` });
        
        // Unlocks tab entries
        happen("Unlocks", null, town, { text: `New technologies unlocked for ${nextAge}!` });
        
        // Bonuses per age
        switch(nextAge) {
            case "Bronze Age": town.military.power += 10; break;
            case "Iron Age": town.military.power += 20; break;
            case "Industrial Age":
                town.productionRate = (town.productionRate||1)*1.2;
                town.travelSpeed = (town.travelSpeed||1)*1.5;
                break;
            case "Modern Age":
                town.military.power += 50;
                town.tradeEfficiency = (town.tradeEfficiency||1)*1.3;
                break;
        }
    }

    // Choice questions per age
    const AGE_QUESTIONS = {

        "Stone Age": [
            {
                message: town => `${town.name} is experimenting with simple tools, do you promote this?`,
                resources: { stone: 5 }, mood: 5, crime: 0.5
            },
            {
                message: town => `${town.name} is trying to build a better hut, do you promote this?`,
                resources: { wood: 5 }, mood: 3, crime: 0.2
            }
        ],

        "Bronze Age": [
            {
                message: town => `${town.name} is experimenting with molten copper and tin, do you promote this?`,
                resources: { bronze: 5 }, mood: 5, crime: 1
            },
            {
                message: town => `${town.name} is trying to put bronze on sticks, do you promote this?`,
                resources: { bronze: 3 }, mood: 4, crime: 1.5
            },
            {
                message: town => `${town.name} is forging their first bronze weapons, do you promote this?`,
                resources: { bronze: 5 }, mood: 6, crime: 2
            }
        ],

        "Iron Age": [
            {
                message: town => `${town.name} is smelting iron ores, do you promote this?`,
                resources: { iron: 5 }, mood: 5, crime: 2
            },
            {
                message: town => `${town.name} is trying to make iron swords, do you promote this?`,
                resources: { iron: 5 }, mood: 6, crime: 3
            }
        ],

        "Classical Age": [
            {
                message: town => `${town.name} is building roads and aqueducts, do you promote this?`,
                resources: { stone: 5 }, mood: 4, crime: 2
            },
            {
                message: town => `${town.name} is training their first legion, do you promote this?`,
                resources: { military: 5 }, mood: 5, crime: 3
            }
        ],

        "Medieval Age": [
            {
                message: town => `${town.name} is constructing castles, do you promote this?`,
                resources: { stone: 10 }, mood: 6, crime: 4
            },
            {
                message: town => `${town.name} is establishing guilds, do you promote this?`,
                resources: { gold: 5 }, mood: 5, crime: 3
            }
        ],

        "Renaissance": [
            {
                message: town => `${town.name} is experimenting with art and science, do you promote this?`,
                resources: { knowledge: 5 }, mood: 7, crime: 2
            },
            {
                message: town => `${town.name} is building observatories, do you promote this?`,
                resources: { science: 5 }, mood: 6, crime: 3
            }
        ],

        "Industrial Age": [
            {
                message: town => `${town.name} is building steam engines, do you promote this?`,
                resources: { coal: 10 }, mood: 6, crime: 4
            },
            {
                message: town => `${town.name} is establishing factories, do you promote this?`,
                resources: { production: 5 }, mood: 5, crime: 5
            }
        ],

        "Modern Age": [
            {
                message: town => `${town.name} is developing railroads and modern weapons, do you promote this?`,
                resources: { tech: 10 }, mood: 5, crime: 5
            },
            {
                message: town => `${town.name} is building skyscrapers and trade networks, do you promote this?`,
                resources: { gold: 10 }, mood: 6, crime: 4
            }
        ],

        "Information Age": [
            {
                message: town => `${town.name} is creating computers and networks, do you promote this?`,
                resources: { tech: 15 }, mood: 7, crime: 3
            },
            {
                message: town => `${town.name} is developing AI and satellites, do you promote this?`,
                resources: { tech: 20 }, mood: 8, crime: 4
            }
        ]
    };

    // Daily event: prompt Yes/No questions for each town
    Mod.event("ageYesNoQuestions", {
        daily: true,
        target: { reg: "town", all: true },

        func: (subject, town) => {
            const age = town.age || "Stone Age";
            const choices = AGE_QUESTIONS[age];
            if (!choices) return;

            // Pick random choice
            const choice = choices[Math.floor(Math.random() * choices.length)];

            // Yes/No Event
            Mod.event(`ageChoice_${town.id}_${planet.day}`, {
                target: { reg: "town", id: town.id },
                message: choice.message(town),

                // YES branch: progress to next age
                func: (s, t) => {
                    t.mood = (t.mood || 50) + choice.mood;
                    t.crime = (t.crime || 0) + choice.crime;

                    t.resources = t.resources || {};
                    for (let key in choice.resources) {
                        t.resources[key] = (t.resources[key] || 0) + choice.resources[key];
                    }

                    happen("Unlocks", null, t, { text: `Your town experimented with ${Object.keys(choice.resources).join(", ")}.` });

                    // Advance town to next age immediately
                    const currentIndex = AGE_ORDER.indexOf(t.age);
                    const nextAge = AGE_ORDER[currentIndex + 1];
                    if (nextAge) advanceAge(t, nextAge);
                },

                // NO branch: write to Chronicle
                funcNo: (s, t) => {
                    t.mood = (t.mood || 50) - 2;
                    happen("Chronicle", null, t, { text: `${t.name} is going to lay off the experimentation for a bit...` });
                },

                messageDone: (s, t) => `${t.name} completed the choice.`,
                messageNo: (s, t) => `${t.name} declined the choice.`
            });
        }
    });

})();
