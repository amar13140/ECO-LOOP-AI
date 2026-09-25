/* =====================================
   ECOLOOP AI APP
===================================== */


/* =====================================
   APP DATA
===================================== */

let ecoPoints =
    Number(localStorage.getItem("ecoPoints")) || 250;

let recycledItems =
    Number(localStorage.getItem("recycledItems")) || 12;

let plasticSaved =
    Number(localStorage.getItem("plasticSaved")) || 4.8;

let co2Saved =
    Number(localStorage.getItem("co2Saved")) || 8.2;


/* =====================================
   UPDATE DASHBOARD
===================================== */

function updateDashboard() {

    document.getElementById("pointsDisplay")
        .textContent = ecoPoints;

    document.getElementById("rewardPoints")
        .textContent = ecoPoints;

    document.getElementById("itemsCount")
        .textContent = recycledItems;

    document.getElementById("plasticCount")
        .textContent =
        plasticSaved.toFixed(1);

    document.getElementById("co2Count")
        .textContent =
        co2Saved.toFixed(1);


    document.getElementById("impactItems")
        .textContent = recycledItems;

    document.getElementById("impactPlastic")
        .textContent =
        plasticSaved.toFixed(1);

    document.getElementById("impactCO2")
        .textContent =
        co2Saved.toFixed(1);


    /*
       Reward progress
    */

    let progress =
        (ecoPoints % 500) / 500 * 100;

    if (ecoPoints >= 500) {

        progress = 100;

    }

    document.getElementById("progressBar")
        .style.width = progress + "%";


    document.getElementById("progressText")
        .textContent =
        `${ecoPoints} / 500`;


    /*
       Save data
    */

    localStorage.setItem(
        "ecoPoints",
        ecoPoints
    );

    localStorage.setItem(
        "recycledItems",
        recycledItems
    );

    localStorage.setItem(
        "plasticSaved",
        plasticSaved
    );

    localStorage.setItem(
        "co2Saved",
        co2Saved
    );
}


/* =====================================
   TOAST MESSAGE
===================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const text =
        document.getElementById("toastMessage");

    text.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


/* =====================================
   IMAGE UPLOAD
===================================== */

const imageInput =
    document.getElementById("imageInput");

const previewImage =
    document.getElementById("previewImage");

const previewPlaceholder =
    document.querySelector(
        ".preview-placeholder"
    );


imageInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) return;


        /*
           Check file type
        */

        if (!file.type.startsWith("image/")) {

            showToast(
                "Please select an image."
            );

            return;
        }


        /*
           Create preview
        */

        const reader =
            new FileReader();

        reader.onload =
            function (event) {

                previewImage.src =
                    event.target.result;

                previewImage.style.display =
                    "block";

                previewPlaceholder.style.display =
                    "none";


                /*
                   Simulate AI analysis
                */

                setTimeout(
                    simulateAI,
                    1200
                );

            };

        reader.readAsDataURL(file);

    }
);


/* =====================================
   AI SIMULATION
===================================== */

function simulateAI() {

    const wasteTypes = [

        {
            name: "Plastic Bottle",

            description:
                "This item is commonly recyclable. Please empty and clean it before recycling.",

            confidence:
                "94% Confidence"
        },

        {
            name: "Paper / Cardboard",

            description:
                "This material can generally be recycled when it is clean and dry.",

            confidence:
                "91% Confidence"
        },

        {
            name: "Metal Can",

            description:
                "Metal cans are recyclable. Rinse the container before placing it in recycling.",

            confidence:
                "96% Confidence"
        },

        {
            name: "Glass Container",

            description:
                "Glass containers can often be recycled. Separate them from other materials.",

            confidence:
                "89% Confidence"
        }

    ];


    const result =
        wasteTypes[
            Math.floor(
                Math.random() *
                wasteTypes.length
            )
        ];


    document.getElementById("resultTitle")
        .textContent =
        result.name;

    document.getElementById("resultDescription")
        .textContent =
        result.description;

    document.getElementById("confidence")
        .textContent =
        result.confidence;


    document.getElementById("scanResult")
        .classList.add("show");


    showToast(
        "AI analysis completed!"
    );
}


/* =====================================
   RECYCLING REWARD
===================================== */

document.getElementById(
    "recycleBtn"
).addEventListener(
    "click",
    function () {

        ecoPoints += 25;

        recycledItems += 1;

        plasticSaved += 0.4;

        co2Saved += 0.7;


        updateDashboard();


        showToast(
            "♻ +25 EcoPoints added!"
        );

    }
);


/* =====================================
   REWARD REDEMPTION
===================================== */

document.querySelectorAll(
    ".redeem-btn"
).forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                const cost =
                    Number(
                        this.dataset.cost
                    );


                if (ecoPoints < cost) {

                    showToast(
                        `You need ${cost - ecoPoints} more points.`
                    );

                    return;
                }


                ecoPoints -= cost;

                updateDashboard();


                showToast(
                    "🎉 Reward redeemed successfully!"
                );

            }
        );

    }
);


/* =====================================
   DARK MODE
===================================== */

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


const savedTheme =
    localStorage.getItem(
        "theme"
    );


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark"
    );

    themeBtn.textContent = "☀️";
}


themeBtn.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "theme",
            dark ? "dark" : "light"
        );


        themeBtn.textContent =
            dark ? "☀️" : "🌙";

    }
);


/* =====================================
   CAMERA
===================================== */

const cameraBtn =
    document.getElementById(
        "cameraBtn"
    );


cameraBtn.addEventListener(
    "click",
    function () {

        /*
           On mobile devices this opens
           the camera through the file picker.
        */

        imageInput.setAttribute(
            "capture",
            "environment"
        );

        imageInput.click();

    }
);


/* =====================================
   MAP
===================================== */

function openMap() {

    /*
       Opens Google Maps search.
       You can later replace this with
       your own recycling-center API.
    */

    window.open(
        "https://www.google.com/maps/search/recycling+center",
        "_blank"
    );
}


/* =====================================
   INITIALIZE APP
===================================== */

updateDashboard();
