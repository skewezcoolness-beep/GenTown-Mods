// Ages Mod — Full Version with Stats for Every Age
// By skewez

(function() {

    // Ensure the Day 1 notification runs only once
    let agesModNotified = false;

    // Age list
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

    // Age-specific questions and stat effects
    const AGE_QUESTIONS = {

        "Stone Age": [
            { text: t => `${t.name} is experimenting with simple tools, do you promote this?`, mood: 3, crime: 0.2, birth: 1, disease: -1, travel: 0.1 },
            { text: t => `${t.name} is building huts and improving shelters, do you promote this?`, mood: 4, crime: 0.1, birth: 1, disease: -2, resources: { wood: 5 } }
        ],

        "Bronze Age": [
            { text: t => `${t.name} is experimenting with molten copper and tin, do you promote this?`, mood: 5, crime: 1, birth: 0, disease: 0, military: 2, resources: { bronze: 5 } },
            { text: t => `${t.name} is trying to put bronze on sticks, do you promote this?`, mood: 4, crime: 1.5, birth: 0, military: 3, trade: 1 }
        ],

        "Iron Age": [
            { text: t => `${t.name} is smelting iron ores, do you promote this?`, mood: 5, crime: 2, military: 5, trade: 1 },
            { text: t => `${t.name} is forging iron weapons, do you promote this?`, mood: 6, crime: 2, military: 7, travel: 0.2 }
        ],

        "Classical Age": [
            { text: t => `${t.name} is building roads and aqueducts, do you promote this?`, mood: 4, travel: 0.5, birth: 1, disease: -1, trade: 2 },
            { text: t => `${t.name} is training their first legions, do you promote this?`, mood: 5, military: 10, crime: 2 }
        ],

        "Medieval Age": [
            { text: t => `${t.name} is constructing castles, do you promote this?`, mood: 6, military: 15, crime: 4 },
            { text: t => `${t.name} is establishing guilds, do you promote this?`, mood: 5, trade: 4, birth: 1 }
        ],

        "Renaissance": [
            { text: t => `${t.name} is experimenting with art and science, do you promote this?`, mood: 7, tech: 5, trade: 2 },
            { text: t => `${t.name} is building observatories, do you promote this?`, mood: 6, tech: 6, disease: -1 }
        ],

        "Industrial Age": [
            { text: t => `${t.name} is building steam engines, do you promote this?`, mood: 6, production: 5, trade: 3, crime: 4 },
            { text: t => `${t.name} is establishing factories, do you promote this?`, mood: 5, production: 7, disease: 2, birth: -1 }
        ],

        "Modern Age": [
            { text: t => `${t.name} is developing railroads and modern weapons, do you promote this?`, mood: 5, military: 20, travel: 1, trade: 5 },
            { text: t => `${t.name} is building skyscrapers and trade networks, do you promote this?`, mood: 6, trade: 6, crime: 3, resources: { gold: 10 } }
        ],

        "Information Age": [
            { text: t => `${t.name} is creating computers and networks, do you promote this?`, mood: 7, tech: 10, trade: 3 },
            { text: t => `${t.name} is developing AI and satellites, do you promote this?`, mood: 8, tech: 12, military: 10 }
        ]
    };

    // Advance town age
    function advanceAge(town) {
        const currentIndex = AGE_ORDER.indexOf(town.age);
        if (currentIndex + 1 < AGE_ORDER.length) {
            town.age = AGE_ORDER[currentIndex + 1];
            happen("Chronicle", null, town, { text: `${town.name} has advanced to the ${town.age}!` });
            happen("Unlocks", null, town, { text: `New technologies unlocked for ${town.age}!` });
        }
    }

    // Daily event for all towns
    Mod.event("dailyAgeEvent", {
        daily: true,
        target: { reg: "town", all: true },
        func: (subject, town) => {

            // Initialize age if missing
            if (!town.age) town.age = "Stone Age";

            // Day 1 Chronicle notification
            if (!agesModNotified) {
                happen("Chronicle", null, null, { text: "Ages Mod by skewez has been loaded successfully!" });
                agesModNotified = true;
            }

            // Select a random question for the town's age
            const questions = AGE_QUESTIONS[town.age];
            if (!questions) return;
            const question = questions[Math.floor(Math.random() * questions.length)];

            // Create Yes/No event
            Mod.event(`ageChoice_${town.id}_${planet.day}`, {
                target: { reg: "town", id: town.id },
                message: question.text(town),

                func: (s, t) => {
                    t.mood = (t.mood || 50) + (question.mood || 0);
                    t.crime = (t.crime || 0) + (question.crime || 0);
                    t.birth = (t.birth || 0) + (question.birth || 0);
                    t.disease = (t.disease || 0) + (question.disease || 0);
                    t.travelSpeed = (t.travelSpeed || 1) + (question.travel || 0);
                    t.military = (t.military || 0) + (question.military || 0);
                    t.tradeEfficiency = (t.tradeEfficiency || 1) + (question.trade || 0);
                    t.tech = (t.tech || 0) + (question.tech || 0);
                    t.productionRate = (t.productionRate || 1) + (question.production || 0);

                    // Add resources if specified
                    if (question.resources) {
                        t.resources = t.resources || {};
                        for (let key in question.resources) {
                            t.resources[key] = (t.resources[key] || 0) + question.resources[key];
                        }
                    }

                    advanceAge(t);
                },

                funcNo: (s, t) => {
                    t.mood = (t.mood || 50) - 2;
                    happen("Chronicle", null, t, { text: `${t.name} is going to lay off the experimentation for a bit...` });
                }
            });
        }
    });

})();
