/* =====================================================
   ECOLOOP AI
   Main JavaScript
===================================================== */


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let currentUser = null;

let cameraStream = null;

let aiModel = null;

let lastDetectedWaste = null;


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    checkLogin();

    loadAIModel();

});


/* =====================================================
   AUTHENTICATION
===================================================== */

function showRegister() {

    document
        .getElementById("loginForm")
        .classList.add("hidden");

    document
        .getElementById("registerForm")
        .classList.remove("hidden");

}


function showLogin() {

    document
        .getElementById("registerForm")
        .classList.add("hidden");

    document
        .getElementById("loginForm")
        .classList.remove("hidden");

}


function register() {

    const name =
        document.getElementById("registerName").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;


    if (!name || !email || !password) {

        showAuthMessage(
            "Please fill all fields.",
            "red"
        );

        return;
    }


    if (password.length < 6) {

        showAuthMessage(
            "Password must contain at least 6 characters.",
            "red"
        );

        return;
    }


    const user = {

        name: name,

        email: email,

        password: password,

        items: 0,

        points: 0,

        co2: 0,

        plastic: 0

    };


    localStorage.setItem(
        "ecoloopUser",
        JSON.stringify(user)
    );


    currentUser = user;


    showAuthMessage(
        "Account created successfully!",
        "green"
    );


    setTimeout(() => {

        openApp();

    }, 700);

}


function login() {

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    const savedUser =
        JSON.parse(
            localStorage.getItem("ecoloopUser")
        );


    if (!savedUser) {

        showAuthMessage(
            "No account found. Please create an account.",
            "red"
        );

        return;
    }


    if (
        email === savedUser.email &&
        password === savedUser.password
    ) {

        currentUser = savedUser;

        openApp();

    } else {

        showAuthMessage(
            "Incorrect email or password.",
            "red"
        );

    }

}


function logout() {

    stopCamera();

    currentUser = null;

    document
        .getElementById("app")
        .classList.add("hidden");

    document
        .getElementById("authScreen")
        .classList.remove("hidden");

}


function checkLogin() {

    const savedUser =
        JSON.parse(
            localStorage.getItem("ecoloopUser")
        );


    if (savedUser) {

        currentUser = savedUser;

        openApp();

    }

}


function openApp() {

    document
        .getElementById("authScreen")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");


    updateProfile();

    updateDashboard();

}


function showAuthMessage(message, color) {

    const element =
        document.getElementById("authMessage");

    element.textContent = message;

    element.style.color =
        color === "red"
            ? "#dc2626"
            : "#16a34a";

}


/* =====================================================
   PROFILE
===================================================== */

function updateProfile() {

    if (!currentUser) return;


    document.getElementById(
        "profileName"
    ).textContent = currentUser.name;


    document.getElementById(
        "profileEmail"
    ).textContent = currentUser.email;


    document.getElementById(
        "profileAvatar"
    ).textContent =
        currentUser.name
            .charAt(0)
            .toUpperCase();

}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.add("hidden");

        });


    document
        .getElementById(pageName)
        .classList.remove("hidden");


    const titles = {

        dashboard: "Dashboard",

        scanner: "AI Scanner",

        recycling: "Recycling",

        impact: "My Impact",

        rewards: "Rewards"

    };


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[pageName];


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

        });


    if (pageName === "dashboard") {

        document
            .querySelectorAll(".nav-item")[0]
            .classList.add("active");

    }

}


function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("open");

}


/* =====================================================
   DARK MODE
===================================================== */

function toggleTheme() {

    document.body.classList.toggle("dark");


    const dark =
        document.body.classList.contains("dark");


    localStorage.setItem(
        "ecoloopDarkMode",
        dark
    );

}


if (
    localStorage.getItem("ecoloopDarkMode") === "true"
) {

    document.body.classList.add("dark");

}


/* =====================================================
   AI MODEL
===================================================== */

async function loadAIModel() {

    try {

        console.log("Loading AI model...");

        aiModel =
            await mobilenet.load();

        console.log(
            "AI model loaded successfully."
        );

    } catch (error) {

        console.error(
            "AI model loading failed:",
            error
        );

    }

}


/* =====================================================
   CAMERA
===================================================== */

async function startCamera() {

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: "environment"
                },

                audio: false

            });


        const video =
            document.getElementById("camera");


        video.srcObject =
            cameraStream;


        document
            .getElementById("cameraPlaceholder")
            .classList.add("hidden");


    } catch (error) {

        alert(
            "Camera permission denied or unavailable."
        );

        console.error(error);

    }

}


function stopCamera() {

    if (!cameraStream) return;


    cameraStream
        .getTracks()
        .forEach(track => track.stop());


    cameraStream = null;

}


/* =====================================================
   CAPTURE CAMERA IMAGE
===================================================== */

async function captureImage() {

    if (!cameraStream) {

        alert(
            "Please start the camera first."
        );

        return;
    }


    const video =
        document.getElementById("camera");

    const canvas =
        document.getElementById("canvas");


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    const context =
        canvas.getContext("2d");


    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    await classifyImage(canvas);

}


/* =====================================================
   IMAGE UPLOAD
===================================================== */

async function handleUpload(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    const image =
        new Image();


    image.onload = async () => {

        await classifyImage(image);

    };


    image.src =
        URL.createObjectURL(file);

}


/* =====================================================
   AI IMAGE CLASSIFICATION
===================================================== */

async function classifyImage(image) {

    const resultBox =
        document.getElementById("scanResult");


    resultBox.classList.remove("hidden");


    document.getElementById(
        "wasteName"
    ).textContent =
        "Analyzing...";


    if (!aiModel) {

        await loadAIModel();

    }


    try {

        const predictions =
            await aiModel.classify(image);


        console.log(predictions);


        const prediction =
            predictions[0];


        const label =
            prediction.className.toLowerCase();


        const waste =
            identifyWaste(label);


        lastDetectedWaste =
            waste;


        document.getElementById(
            "wasteName"
        ).textContent =
            waste.name;


        document.getElementById(
            "wasteCategory"
        ).textContent =
            waste.category;


        document.getElementById(
            "disposalAdvice"
        ).textContent =
            waste.advice;


    } catch (error) {

        console.error(error);

        document.getElementById(
            "wasteName"
        ).textContent =
            "Unable to identify";


        document.getElementById(
            "disposalAdvice"
        ).textContent =
            "Please try another image.";

    }

}


/* =====================================================
   WASTE DATABASE
===================================================== */

function identifyWaste(label) {

    if (
        label.includes("bottle") ||
        label.includes("plastic")
    ) {

        return {

            name: "Plastic Bottle",

            category: "Plastic Recycling",

            advice:
                "Empty, rinse and place the bottle in a plastic recycling bin."

        };

    }


    if (
        label.includes("can") ||
        label.includes("tin")
    ) {

        return {

            name: "Metal Can",

            category: "Metal Recycling",

            advice:
                "Rinse the can and place it in the metal recycling bin."

        };

    }


    if (
        label.includes("paper") ||
        label.includes("book") ||
        label.includes("envelope")
    ) {

        return {

            name: "Paper Product",

            category: "Paper Recycling",

            advice:
                "Keep paper dry and place it in the paper recycling collection."

        };

    }


    if (
        label.includes("carton") ||
        label.includes("box")
    ) {

        return {

            name: "Cardboard",

            category: "Paper/Cardboard",

            advice:
                "Flatten the cardboard and place it in the paper recycling bin."

        };

    }


    if (
        label.includes("glass")
    ) {

        return {

            name: "Glass",

            category: "Glass Recycling",

            advice:
                "Separate glass from other waste and take it to a glass recycling point."

        };

    }


    return {

        name: "General Waste",

        category: "Check Local Guidelines",

        advice:
            "The AI could not confidently identify the material. Check your local waste guidelines."

    };

}


/* =====================================================
   ADD RECYCLED ITEM
===================================================== */

function addRecycledItem() {

    if (!currentUser) return;


    currentUser.items += 1;

    currentUser.points += 50;

    currentUser.co2 += 0.5;


    if (
        lastDetectedWaste &&
        lastDetectedWaste.category.includes("Plastic")
    ) {

        currentUser.plastic += 0.2;

    }


    saveUser();


    updateDashboard();


    alert(
        "♻️ Item added! You earned 50 EcoPoints."
    );

}


/* =====================================================
   SAVE USER
===================================================== */

function saveUser() {

    localStorage.setItem(
        "ecoloopUser",
        JSON.stringify(currentUser)
    );

}


/* =====================================================
   DASHBOARD UPDATE
===================================================== */

function updateDashboard() {

    if (!currentUser) return;


    document.getElementById(
        "itemsRecycled"
    ).textContent =
        currentUser.items;


    document.getElementById(
        "ecoPoints"
    ).textContent =
        currentUser.points;


    document.getElementById(
        "co2Saved"
    ).textContent =
        currentUser.co2.toFixed(1) + " kg";


    document.getElementById(
        "ecoLevel"
    ).textContent =
        calculateLevel();


    document.getElementById(
        "impactItems"
    ).textContent =
        currentUser.items;


    document.getElementById(
        "plasticSaved"
    ).textContent =
        currentUser.plastic.toFixed(1) + " kg";


    document.getElementById(
        "impactCO2"
    ).textContent =
        currentUser.co2.toFixed(1) + " kg";


    document.getElementById(
        "impactPoints"
    ).textContent =
        currentUser.points;


    document.getElementById(
        "rewardPoints"
    ).textContent =
        currentUser.points;


    const progress =
        Math.min(
            currentUser.items * 5,
            100
        );


    document.getElementById(
        "impactProgress"
    ).style.width =
        progress + "%";


    if (currentUser.items === 0) {

        document.getElementById(
            "impactText"
        ).textContent =
            "Start recycling to build your impact.";

    } else {

        document.getElementById(
            "impactText"
        ).textContent =
            `You have responsibly recycled ${currentUser.items} items. Keep going!`;

    }

}


/* =====================================================
   ECO LEVEL
===================================================== */

function calculateLevel() {

    const points =
        currentUser.points;


    if (points >= 5000)
        return "Eco Hero";

    if (points >= 2500)
        return "Planet Protector";

    if (points >= 1000)
        return "Eco Champion";

    if (points >= 500)
        return "Green Warrior";

    return "Beginner";

}


/* =====================================================
   RECYCLING LOCATOR
===================================================== */

function findRecycling() {

    if (!navigator.geolocation) {

        alert(
            "Location is not supported by this browser."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        position => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            document
                .getElementById("mapResult")
                .classList.remove("hidden");


            document.getElementById(
                "locationText"
            ).textContent =
                `Your location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;


            const url =
                `https://www.google.com/maps/search/recycling+center/@${lat},${lon},14z`;


            document.getElementById(
                "mapLink"
            ).href = url;

        },

        error => {

            alert(
                "Please allow location permission."
            );

        }

    );

}


/* =====================================================
   REWARDS
===================================================== */

function redeemReward(cost) {

    if (currentUser.points < cost) {

        alert(
            `You need ${cost} EcoPoints to redeem this reward.`
        );

        return;
    }


    currentUser.points -= cost;


    saveUser();

    updateDashboard();


    alert(
        "🎉 Reward redeemed successfully!"
    );

}
