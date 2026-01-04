// Add this in your HTML <head> before script.js
// <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

const base_url = "https://itrbackend.bainancecapital.in/";

const salariedPlans = [
  {
    name: "Starter",
    price: { "1 Year": 751, "2 Year": 1451 },
    features: [
      "Form-16",
      "Dashboard for managing service",
      "Mobile application support",
      "Documents sharing facility",
      "Download deliverables any time",
      "Password sharing",
      "Round the clock support",
      "Time to time updates & notifications",
    ],
  },
  {
    name: "Basic",
    price: { "1 Year": 1351, "2 Year": 1951 },
    features: [
      "Form-16",
      "Arrear’s Salary",
      "Aadhar Card",
      "PAN Card",
      "Bank Details",
      "Email-ID",
      "Mobile Number",
      "Income from other sources",
    ],
  },
];

const businessPlans = [
  {
    name: "Starter",
    price: { "1 Year": 751, "2 Year": 1451 },
    features: [
      "Estimated Income/Turnover (Section 44AD/44ADA)",
      "Aadhar Card",
      "PAN Card",
      "Email-ID",
      "Mobile Number",
      "Password Sharing",
      "Time to Time Update",
    ],
  },
  {
    name: "Basic",
    price: { "1 Year": 1451, "2 Year": 1951 },
    features: [
      "Estimated Income/Turnover (Section 44AD/44ADA)",
      "Aadhar Card",
      "PAN Card",
      "Email-ID",
      "Mobile Number",
      "B & L Preparation",
      "Password Sharing",
      "Time to Time Update",
    ],
  },
];

let currentType = "salaried";
const planContainer = document.getElementById("planContainer");

// 🔹 Create dynamic plan cards
function createPlanCard(plan) {
  const planCard = document.createElement("div");
  planCard.className = "plan-card";

  const header = document.createElement("div");
  header.className = "plan-header";
  header.textContent = plan.name;

  const tenureBox = document.createElement("div");
  tenureBox.className = "tenure-box";

  const select = document.createElement("select");
  select.className = "select-tenure";
  select.innerHTML = `
    <option value="">Select Tenure</option>
    <option value="1 Year">1 Year @ ₹${plan.price["1 Year"]}</option>
    <option value="2 Year">2 Year @ ₹${plan.price["2 Year"]}</option>
  `;

  const form = document.createElement("form");
  form.className = "plan-form";
  form.style.display = "none"; // hidden by default
  form.innerHTML = `
    <input type="text" name="name" placeholder="Name" required />
    <input type="email" name="email" placeholder="Email" required />
    <input type="tel" name="contact" placeholder="Contact No" required />
    <input type="text" name="location" placeholder="Location (optional)" />
    <button type="submit">Pay Now</button>
  `;

  select.addEventListener("change", () => {
    if (select.value) {
      form.style.display = "block";
      form.dataset.amount = plan.price[select.value];
      form.dataset.plan = plan.name;
      form.dataset.tenure = select.value;
    } else {
      form.style.display = "none";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      name: form.name.value,
      email: form.email.value,
      contact: form.contact.value,
      location: form.location.value,
    };
    const amount = form.dataset.amount;
    const planName = form.dataset.plan;
    const tenure = form.dataset.tenure;

    await startPayment(planName, amount, tenure, formData);
  });

  const featureList = document.createElement("ul");
  plan.features.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = `✔ ${f}`;
    featureList.appendChild(li);
  });

  tenureBox.appendChild(select);
  planCard.append(header, tenureBox, form, featureList);
  return planCard;
}

// 🔹 Render plans dynamically
function renderPlans(type) {
  planContainer.innerHTML = "";
  const plans = type === "salaried" ? salariedPlans : businessPlans;
  plans.forEach((p) => planContainer.appendChild(createPlanCard(p)));
}

// 🔹 Razorpay + SweetAlert integration
async function startPayment(plan, amount, tenure, formData) {
  try {
    // 1️⃣ Create order on backend
    const res = await fetch(`${base_url}create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        amount,
        tenure,
        ...formData,
      }),
    });

    const orderData = await res.json();

    // 2️⃣ Open Razorpay payment window
    const options = {
      key: "rzp_test_RaNSgYB3Dkk5Tk", // Replace with your Razorpay Key ID
      amount: orderData.amount,
      currency: orderData.currency,
      name: "ITR Solution",
      description: `${plan} Plan Payment`,
      order_id: orderData.id,
      handler: async function (response) {
        // 3️⃣ Verify payment
        await fetch(`${base_url}verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderData.id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        });

        Swal.fire({
          title: "✅ Payment Successful!",
          text: `Thank you for purchasing the ${plan} Plan.`,
          icon: "success",
          confirmButtonColor: "#ff8c00",
          timer: 2500,
          showConfirmButton: false,
        });
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
      },
      theme: {
        color: "#ff8c00",
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment Error:", err);
    Swal.fire({
      title: "❌ Payment Failed",
      text: "Something went wrong. Please try again later.",
      icon: "error",
      confirmButtonColor: "#ff8c00",
    });
  }
}

// 🔹 Initial render
renderPlans(currentType);

// 🔹 Toggle between plan types
document.getElementById("salariedBtn").addEventListener("click", () => {
  currentType = "salaried";
  renderPlans(currentType);
  document.getElementById("salariedBtn").classList.add("active");
  document.getElementById("businessBtn").classList.remove("active");
});

document.getElementById("businessBtn").addEventListener("click", () => {
  currentType = "business";
  renderPlans(currentType);
  document.getElementById("businessBtn").classList.add("active");
  document.getElementById("salariedBtn").classList.remove("active");
});

// 🔹 Contact form submission with SweetAlert
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const email = document.getElementById("email").value.trim();
    const city = document.getElementById("city").value.trim();

    if (!name || !contact || !email || !city) {
      Swal.fire({
        title: "⚠️ Missing Fields",
        text: "Please fill in all required fields.",
        icon: "warning",
        confirmButtonColor: "#ff8c00",
      });
      return;
    }

    try {
      const res = await fetch(`${base_url}contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, email, city }),
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          title: "✅ Thank You!",
          text: "We’ll contact you soon.",
          icon: "success",
          confirmButtonColor: "#ff8c00",
          timer: 2500,
          showConfirmButton: false,
        });
        contactForm.reset();
      } else {
        Swal.fire({
          title: "❌ Error",
          text: "Something went wrong. Please try again.",
          icon: "error",
          confirmButtonColor: "#ff8c00",
        });
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      Swal.fire({
        title: "⚠️ Network Error",
        text: "Please try again later.",
        icon: "warning",
        confirmButtonColor: "#ff8c00",
      });
    }
  });
});
