// ===================================================================
// ধাপ ১: HTML এর element গুলো খুঁজে বের করে ভ্যারিয়েবলে রাখা হচ্ছে
// getElementById(...) মানে: HTML এ যে id="..." দেওয়া আছে, সেটা খুঁজে বের করো
// ===================================================================

const chatToggle = document.getElementById("chatToggle");
// chatToggle = নিচে-ডানে ভাসমান 💬 বাটন, যেটাতে ক্লিক করলে চ্যাট খোলে

const chatPanel = document.getElementById("chatPanel");
// chatPanel = পুরো চ্যাট বক্স (উপরের হেডার + মেসেজ + ইনপুট সব একসাথে)

const chatClose = document.getElementById("chatClose");
// chatClose = চ্যাট প্যানেলের ভেতরের ✕ (বন্ধ করার) বাটন

const chatForm = document.getElementById("chatForm");
// chatForm = যেখানে টাইপ করে "Send" চাপা হয়, সেই ফর্মটা

const chatInput = document.getElementById("chatInput");
// chatInput = যে ছোট্ট টেক্সট বক্সে ইউজার টাইপ করবে

const chatMessages = document.getElementById("chatMessages");
// chatMessages = যেখানে সব বট/ইউজারের মেসেজ একটার পর একটা দেখানো হয়

const chatOptions = document.getElementById("chatOptions");
// chatOptions = ক্লিকযোগ্য প্রশ্ন-বাটনগুলো যে div এ থাকবে (নতুন)


// ===================================================================
// ধাপ ২: প্রশ্ন আর উত্তরের তালিকা
// প্রতিটা object এ ২টা জিনিস: 'label' (বাটনে যা লেখা দেখাবে),
// আর 'keywords' (কোন কোন শব্দ থাকলে এই উত্তর ম্যাচ করবে)
// ===================================================================

const quickQuestions = [
    // প্রতিটা লাইন একটা করে "প্রি-সেট প্রশ্ন", টাইপ না করেও ক্লিক করলেই চলবে
    { label: "What are your skills?", keywords: ["skill"] },
    { label: "Show me your projects", keywords: ["project"] },
    { label: "How can I contact you?", keywords: ["contact", "email"] }
];

// প্রতিটা keyword-group এর জন্য উত্তর এখানে রাখা হলো
const responses = [
    { keywords: ["skill"], reply: "I work with C++, Java, MySQL, HTML, CSS, JavaScript, and design tools like Figma and Photoshop." },
    { keywords: ["project"], reply: "Check the Projects page for my latest work!" },
    { keywords: ["contact", "email"], reply: "You can reach me at yeasinarafat2720003@gmail.com" }
];


// ===================================================================
// ধাপ ৩: চ্যাট বাটনে ক্লিক করলে প্যানেল খোলা/বন্ধ হওয়া
// ===================================================================

chatToggle.addEventListener("click", function () {
    // "click" ইভেন্ট মানে যখন এই বাটনে ক্লিক হবে
    chatPanel.classList.toggle("open");
    // classList.toggle("open") -> যদি "open" ক্লাস না থাকে, যোগ করবে (প্যানেল দেখাবে)
    // যদি আগে থেকেই থাকে, বাদ দেবে (প্যানেল লুকাবে)
});

chatClose.addEventListener("click", function () {
    // ✕ বাটনে ক্লিক করলে প্যানেল বন্ধ (শুধু বন্ধ করে, খোলে না)
    chatPanel.classList.remove("open");
});


// ===================================================================
// ধাপ ৪: একটা মেসেজ চ্যাট বক্সে দেখানোর জন্য আলাদা function
// এটাকে "reusable function" বলে - বারবার লেখা লাগবে না, শুধু call করবো
// ===================================================================

function addMessage(text, sender) {
    // text = কী লেখা দেখাবে, sender = "user" নাকি "bot" (স্টাইলের জন্য)

    const msg = document.createElement("div");
    // নতুন একটা <div> তৈরি করা হলো (এখনো পেজে যোগ হয়নি, শুধু মেমোরিতে আছে)

    msg.classList.add("chat-msg", sender);
    // এই div-কে "chat-msg" আর sender ("user"/"bot") - দুইটা class দেওয়া হলো

    msg.textContent = text;
    // div-এর ভেতরে লেখাটা বসানো হলো

    chatMessages.appendChild(msg);
    // এই নতুন div-কে chatMessages এর ভেতরে যোগ করা হলো (এখন পেজে দেখা যাবে)

    chatMessages.scrollTop = chatMessages.scrollHeight;
    // নতুন মেসেজ আসলে চ্যাটবক্স অটো নিচে scroll হবে
}


// ===================================================================
// ধাপ ৫: প্রশ্নের সাথে মিলিয়ে উত্তর বের করার function
// ===================================================================

function getBotReply(question) {
    const lowerQuestion = question.toLowerCase();
    // toLowerCase() -> সব অক্ষর ছোট হাতের করে দেয়, তাহলে "Skill" আর "skill" একই ধরা হবে

    for (let i = 0; i < responses.length; i++) {
        // responses লিস্টের প্রতিটা item একে একে চেক করা হচ্ছে

        const item = responses[i];

        const found = item.keywords.some(function (word) {
            // .some() মানে: keywords এর মধ্যে অন্তত একটা শব্দ যদি প্রশ্নে থাকে, true হবে
            return lowerQuestion.includes(word);
        });

        if (found) {
            return item.reply;
            // মিলে গেলে সাথে সাথে সেই উত্তর রিটার্ন করে ফাংশন শেষ
        }
    }

    return "I'm not sure — try asking about skills, projects, or contact.";
    // কোনো keyword না মিললে এই ডিফল্ট উত্তর
}


// ===================================================================
// ধাপ ৬: ফর্ম সাবমিট (Send বাটন বা Enter চাপলে) হ্যান্ডেল করা
// ===================================================================

chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // এটা ছাড়া ফর্ম সাবমিট হলে পুরো পেজ reload হয়ে যেত - তাই এটা জরুরি

    const question = chatInput.value.trim();
    // chatInput.value = ইউজার যা টাইপ করেছে
    // .trim() = শুরু/শেষের ফাঁকা স্পেস বাদ দেয়

    if (question === "") {
        return;
        // খালি মেসেজ হলে কিছুই করবে না, ফাংশন এখানেই থেমে যাবে
    }

    addMessage(question, "user");
    // ইউজারের প্রশ্নটা চ্যাটবক্সে দেখানো হলো

    chatInput.value = "";
    // ইনপুট বক্স খালি করে দেওয়া হলো পরের প্রশ্নের জন্য

    const reply = getBotReply(question);
    // প্রশ্ন অনুযায়ী উত্তর বের করা হলো

    setTimeout(function () {
        addMessage(reply, "bot");
        // ৪০০ মিলিসেকেন্ড পর বটের উত্তর দেখানো হবে (রিয়েলের মতো "টাইপ করছে" ফিল আনার জন্য)
    }, 400);
});


// ===================================================================
// ধাপ ৭: ক্লিকযোগ্য option বাটন তৈরি করা (নতুন feature)
// পেজ লোড হওয়ার সাথে সাথে এই কোড একবার চলবে
// ===================================================================

quickQuestions.forEach(function (q) {
    // quickQuestions লিস্টের প্রতিটা প্রশ্নের জন্য একটা করে বাটন বানানো হচ্ছে

    const btn = document.createElement("button");
    // নতুন একটা <button> তৈরি করা হলো

    btn.type = "button";
    // type="button" জরুরি — নাহলে এটা form submit করার চেষ্টা করবে

    btn.className = "chat-option-btn";
    // CSS দিয়ে স্টাইল করার জন্য class দেওয়া হলো

    btn.textContent = q.label;
    // বাটনে যে লেখা দেখাবে (যেমন: "What are your skills?")

    btn.addEventListener("click", function () {
        // এই option বাটনে ক্লিক করলে যা হবে:

        addMessage(q.label, "user");
        // যেন ইউজার নিজেই এই প্রশ্নটা টাইপ করে পাঠিয়েছে এমন দেখাবে

        const reply = getBotReply(q.keywords[0]);
        // এই প্রশ্নের keyword দিয়ে উত্তর বের করা হলো

        setTimeout(function () {
            addMessage(reply, "bot");
        }, 400);
    });

    chatOptions.appendChild(btn);
    // তৈরি হওয়া বাটনটা chatOptions div এর ভেতরে বসানো হলো
});