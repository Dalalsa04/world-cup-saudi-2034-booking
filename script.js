 // MATCHES PAGE FILTER
const stageFilter = document.getElementById("stageFilter");
const cityFilter = document.getElementById("cityFilter");
const matchCards = document.querySelectorAll(".match-card");

if (stageFilter && cityFilter && matchCards.length > 0) {
    function filterMatches() {
        const selectedStage = stageFilter.value;
        const selectedCity = cityFilter.value;

        matchCards.forEach(function(matchCard) {
            const matchStage = matchCard.getAttribute("data-stage");
            const matchCity = matchCard.getAttribute("data-city");

            const stageMatch = selectedStage === "all" || matchStage === selectedStage;
            const cityMatch = selectedCity === "all" || matchCity === selectedCity;

            if (stageMatch && cityMatch) {
                matchCard.style.display = "block";
            } else {
                matchCard.style.display = "none";
            }
        });
    }

    stageFilter.addEventListener("change", filterMatches);
    cityFilter.addEventListener("change", filterMatches);
}

//BOOKING PAGE 

let selectedCategory = null;
let selectedPrice = 0;
let selectedAvailableSeats = 0;
let quantity = 1;
let selectedSeatNumber = null;
let match = null;
let bookedSeats = JSON.parse(localStorage.getItem("wc2034_bookedSeats")) || {};

const matchesData= {
    "brazil-argentina": {
        id: "brazil-argentina",
        teamA: "Brazil",
        teamB: "Argentina",
        flagA: "BR",
        flagB: "AR",
        date: "June 15, 2034",
        time: "20:00",
        city: "Riyadh",
        stadium: "King Fahd International Stadium",
        totalAvailable: 58420,
        priceRange: "$195 - $1,500",
        categories: [
            { name: "VIP", price: 1500, seats: 2400 },
            { name: "Category 1", price: 850, seats: 8600 },
            { name: "Category 2", price: 450, seats: 18200 },
            { name: "Category 3", price: 195, seats: 29220 }
        ]
    },

    "germany-spain": {
        id: "germany-spain",
        teamA: "Germany",
        teamB: "Spain",
        flagA: "DE",
        flagB: "ES",
        date: "June 18, 2034",
        time: "18:00",
        city: "Jeddah",
        stadium: "King Abdullah Sports City",
        totalAvailable: 42800,
        priceRange: "$195 - $1,500",
        categories: [
            { name: "VIP", price: 1500, seats: 1800 },
            { name: "Category 1", price: 850, seats: 7000 },
            { name: "Category 2", price: 450, seats: 14000 },
            { name: "Category 3", price: 195, seats: 20000 }
        ]
    },

    "france-england": {
        id: "france-england",
        teamA: "France",
        teamB: "England",
        flagA: "FR",
        flagB: "EN",
        date: "July 5, 2034",
        time: "21:00",
        city: "Dammam",
        stadium: "Prince Mohammed bin Fahad Stadium",
        totalAvailable: 35200,
        priceRange: "$350 - $2,500",
        categories: [
            { name: "VIP", price: 2500, seats: 1200 },
            { name: "Category 1", price: 1500, seats: 5000 },
            { name: "Category 2", price: 800, seats: 12000 },
            { name: "Category 3", price: 350, seats: 17000 }
        ]
    },

    "final-match": {
        id: "final-match",
        teamA: "TBD",
        teamB: "TBD",
        flagA: "🏆",
        flagB: "🏆",
        date: "July 15, 2034",
        time: "21:00",
        city: "Riyadh",
        stadium: "King Fahd International Stadium",
        totalAvailable: 20000,
        priceRange: "$500 - $5,000",
        categories: [
            { name: "VIP", price: 5000, seats: 800 },
            { name: "Category 1", price: 3000, seats: 3200 },
            { name: "Category 2", price: 1500, seats: 6000 },
            { name: "Category 3", price: 500, seats: 10000 }
        ]
    }
};

const ticketGridElement = document.getElementById("ticketGrid");
const seatMapElement = document.getElementById("seatMap");

if (ticketGridElement && seatMapElement) {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get("match");

    if (!matchId || !matchesData[matchId]) {
    document.getElementById("emptyBookingBox").style.display = "block";
    document.getElementById("bookingContent").style.display = "none";
} else {
    document.getElementById("emptyBookingBox").style.display = "none";
    document.getElementById("bookingContent").style.display = "block";

    match = matchesData[matchId];
    displayMatchDetails();
    displayTicketCategories();
    createSeatMap();
    updateSummary();
}
}

function displayMatchDetails() {
    document.getElementById("flagA").textContent = match.flagA;
    document.getElementById("flagB").textContent = match.flagB;
    document.getElementById("teamA").textContent = match.teamA;
    document.getElementById("teamB").textContent = match.teamB;

    document.getElementById("matchDate").textContent = "📅 " + match.date;
    document.getElementById("matchTime").textContent = "🕒 " + match.time;
    document.getElementById("matchLocation").textContent = "📍 " + match.stadium + ", " + match.city;
    document.getElementById("matchTickets").textContent =
        "🎟️ " + match.totalAvailable.toLocaleString() + " tickets available | " + match.priceRange;

    document.getElementById("summaryMatch").textContent = match.teamA + " vs " + match.teamB;
}

function displayTicketCategories() {
    const ticketGrid = document.getElementById("ticketGrid");
    ticketGrid.innerHTML = "";

    match.categories.forEach(function(category) {
        const categoryButton = document.createElement("button");
        categoryButton.type = "button";
        categoryButton.className = "ticket-category";

        categoryButton.innerHTML = `
            <h3>${category.name}</h3>
            <h2>$${category.price.toLocaleString()}</h2>
            <p>${category.seats.toLocaleString()} seats available</p>
        `;

        categoryButton.onclick = function() {
            selectCategory(category, categoryButton);
        };

        ticketGrid.appendChild(categoryButton);
    });
}

function selectCategory(category, button) {
    selectedCategory = category.name;
    selectedPrice = category.price;
    selectedAvailableSeats = category.seats;
    quantity = 1;
    selectedSeatNumber = null;

    const allCategories = document.querySelectorAll(".ticket-category");

    allCategories.forEach(function(card) {
        card.classList.remove("selected");
    });

    button.classList.add("selected");

    document.getElementById("selectedSeatText").textContent = "None";

    const chosenSeat = document.querySelector(".seat.chosen");
    if (chosenSeat) {
        chosenSeat.classList.remove("chosen");
    }

    updateSummary();
}

function increaseQuantity() {
    if (!selectedCategory) {
        alert("Please select a ticket category first.");
        return;
    }

    if (quantity < 10 && quantity < selectedAvailableSeats) {
        quantity++;
        updateSummary();
    }
}

function decreaseQuantity() {
    if (quantity > 1) {
        quantity--;
        updateSummary();
    }
}

function updateSummary() {
    const summaryCategory = document.getElementById("summaryCategory");

    if (!summaryCategory) {
        return;
    }

    document.getElementById("summaryCategory").textContent = selectedCategory || "None";
    document.getElementById("summaryPrice").textContent = "$" + selectedPrice.toLocaleString();
    document.getElementById("summarySeats").textContent = selectedAvailableSeats.toLocaleString();
    document.getElementById("quantity").textContent = quantity;
    document.getElementById("totalPrice").textContent = "$" + (selectedPrice * quantity).toLocaleString();
}

function createSeatMap() {
    const seatMap = document.getElementById("seatMap");
    const occupiedSeats = bookedSeats[match.id] || [];

    seatMap.innerHTML = "";

    for (let i = 0; i < 60; i++) {
        const seat = document.createElement("button");
        seat.type = "button";

        const row = String.fromCharCode(65 + Math.floor(i / 10));
        const number = (i % 10) + 1;
        const seatNumber = row + number;

        seat.textContent = seatNumber;

        if (occupiedSeats.includes(seatNumber)) {
            seat.className = "seat occupied";
            seat.disabled = true;
        } else {
            seat.className = "seat available";
            seat.onclick = function() {
                selectSeat(seat, seatNumber);
            };
        }

        seatMap.appendChild(seat);
    }
}

function selectSeat(seat, seatNumber) {
    if (!selectedCategory) {
        alert("Please select a ticket category first.");
        return;
    }

    const previousSeat = document.querySelector(".seat.chosen");

    if (previousSeat) {
        previousSeat.classList.remove("chosen");
    }

    seat.classList.add("chosen");
    selectedSeatNumber = seatNumber;

    document.getElementById("selectedSeatText").textContent = selectedSeatNumber;
}

function confirmBooking() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const successMessage = document.getElementById("successMessage");

    if (!selectedCategory) {
        alert("Please select a ticket category.");
        return;
    }

    if (fullName === "" || email === "") {
        alert("Please fill in your full name and email.");
        return;
    }

    if (!selectedSeatNumber) {
        alert("Please select a seat.");
        return;
    }

    let tickets = JSON.parse(localStorage.getItem("wc2034_tickets")) || [];

    for (let i = 0; i < quantity; i++) {
        const newTicket = {
            id: Date.now().toString() + "-" + i,
            customerName: fullName,
            customerEmail: email,
            matchId: match.id,
            match: match,
            category: selectedCategory,
            seat: i === 0 ? selectedSeatNumber : generateSeatNumber(),
            price: selectedPrice,
            qrCode: "WC2034-" + Math.floor(Math.random() * 1000000)
        };

        tickets.push(newTicket);
    }

    localStorage.setItem("wc2034_tickets", JSON.stringify(tickets));

    successMessage.textContent = "Added to cart successfully! Redirecting to My Tickets...";
    if (!bookedSeats[match.id]) {
    bookedSeats[match.id] = [];
}

if (!bookedSeats[match.id]) {
    bookedSeats[match.id] = [];
}

for (let i = 0; i < quantity; i++) {
    const seat = i === 0 ? selectedSeatNumber : generateSeatNumber();
    bookedSeats[match.id].push(seat);
}

localStorage.removeItem("wc2034_bookedSeats");
location.reload();

localStorage.setItem(
    "wc2034_bookedSeats",
    JSON.stringify(bookedSeats)
);
    successMessage.style.display = "block";

    setTimeout(function() {
        window.location.href = "mytickets.html";
    }, 1500);
}

function generateSeatNumber() {
    const row = String.fromCharCode(65 + Math.floor(Math.random() * 6));
    const number = Math.floor(Math.random() * 10) + 1;

    return row + number;
}
// MY TICKETS PAGE
const myTicketsContainer = document.getElementById("myTicketsContainer");
const scheduleContainer = document.getElementById("matchSchedulePlannerContainer");

if (myTicketsContainer && scheduleContainer) {
    const tickets = JSON.parse(localStorage.getItem("wc2034_tickets")) || [];

    const ticketsBox    = document.getElementById("ticketsBox");
    const scheduleBox   = document.getElementById("scheduleBox");
    const emptyTickets  = document.getElementById("emptyTickets");
    const emptySchedule = document.getElementById("emptySchedule");

    if (tickets.length === 0) {
        // show empty states (already in HTML, nothing to do)
    } else {
        // ── Tickets box ──────────────────────────────────────────
        emptyTickets.style.display = "none";

        tickets.forEach(function(ticket) {
            const card = document.createElement("div");
            card.className = "ticket-card";
            card.innerHTML = `
                <p class="match-title">${ticket.match.teamA} vs ${ticket.match.teamB}</p>
                <p>Date: ${ticket.match.date}</p>
                <p>Time: ${ticket.match.time}</p>
                <p>Stadium: ${ticket.match.stadium}, ${ticket.match.city}</p>
                <p>Category: ${ticket.category}</p>
                <p>Seat: ${ticket.seat}</p>
                <button class="cancel-btn" onclick="cancelTicket('${ticket.id}')">Cancel Ticket</button>
            `;
            ticketsBox.appendChild(card);
        });

        // ── Schedule box ─────────────────────────────────────────
        emptySchedule.style.display = "none";

        let conflictFound = false;
        for (let i = 0; i < tickets.length; i++) {
            for (let j = i + 1; j < tickets.length; j++) {
                if (
                    tickets[i].match.date === tickets[j].match.date &&
                    tickets[i].match.time === tickets[j].match.time
                ) {
                    conflictFound = true;
                }
            }
        }

        tickets.forEach(function(ticket) {
            const item = document.createElement("div");
            item.className = "schedule-item";
            item.innerHTML = `
                <p class="match-title">${ticket.match.teamA} vs ${ticket.match.teamB}</p>
                <p>Date: ${ticket.match.date}</p>
                <p>Time: ${ticket.match.time}</p>
                <p>Stadium: ${ticket.match.stadium}, ${ticket.match.city}</p>
            `;
            scheduleBox.appendChild(item);
        });

        const note = document.createElement("p");
        note.className = "schedule-note";
        note.textContent = conflictFound
            ? "⚠ Time conflict detected. You have more than one match at the same time."
            : "✓ Your booked matches are organized with no time conflicts.";
        scheduleBox.appendChild(note);
    }
}

function cancelTicket(ticketId) {
    let tickets = JSON.parse(localStorage.getItem("wc2034_tickets")) || [];
    let bookedSeats = JSON.parse(localStorage.getItem("wc2034_bookedSeats")) || {};

    // find ticket before removing it
    const ticketToCancel = tickets.find(t => t.id === ticketId);

    if (ticketToCancel) {
        const matchId = ticketToCancel.matchId;
        const seat = ticketToCancel.seat;

        // remove seat from bookedSeats array
        if (bookedSeats[matchId]) {
            bookedSeats[matchId] = bookedSeats[matchId].filter(s => s !== seat);

            // cleanup if empty
            if (bookedSeats[matchId].length === 0) {
                delete bookedSeats[matchId];
            }
        }

        localStorage.setItem("wc2034_bookedSeats", JSON.stringify(bookedSeats));
    }

    // remove ticket
    tickets = tickets.filter(ticket => ticket.id !== ticketId);
    localStorage.setItem("wc2034_tickets", JSON.stringify(tickets));

    alert("Ticket cancelled successfully.");
    location.reload();
}