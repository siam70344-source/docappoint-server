  import express       from "express";
  import mongoose      from "mongoose";
  import cors          from "cors";

  import cookieParser  from "cookie-parser";
  import jwt           from "jsonwebtoken";

  import { createRequire } from "module";
  const require = createRequire(import.meta.url);
  const dotenv = require("dotenv");
  dotenv.config();

  const app  = express();
  const PORT = process.env.PORT || 5000;

  // ── Middleware ────────────────────────────────────────────
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://doc-appoint-opal.vercel.app", // update after deploy
      ],
      credentials: true,
    })
  );

  // ─MongoDB ───────────────────────────────────────────────────
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅  MongoDB connected"))
    .catch((err) => console.error("MongoDB error:", err));

  // ── Schemas ───────────────────────────────────────────────────
  const doctorSchema = new mongoose.Schema({
    name:         String,
    specialty:    String,
    image:        String,
    experience:   String,
    availability: [String],
    description:  String,
    hospital:     String,
    location:     String,
    fee:          Number,
    rating:       { type: Number, default: 4.5 },
    totalReviews: { type: Number, default: 0 },
  });

  const appointmentSchema = new mongoose.Schema({
    userEmail:       String,
    doctorId:        String,
    doctorName:      String,
    patientName:     String,
    gender:          String,
    phone:           String,
    appointmentDate: String,
    appointmentTime: String,
    createdAt:       { type: Date, default: Date.now },
  });

  const reviewSchema = new mongoose.Schema({
    doctorId:  String,
    userEmail: String,
    userName:  String,
    userPhoto: String,
    rating:    Number,
    comment:   String,
    createdAt: { type: Date, default: Date.now },
  });

  const Doctor      = mongoose.model("Doctor",      doctorSchema);
  const Appointment = mongoose.model("Appointment", appointmentSchema);
  const Review      = mongoose.model("Review",      reviewSchema);

  // ── JWT Helpers ───────────────────────────────────────────────
  const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = decoded;
      next();
    });
  };

  // ─Auth Routes ────────────────────────────────────────────
  app.post("/jwt", (req, res) => {
    const { email } = req.body;
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .cookie("token", token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .json({ success: true });
  });

  app.post("/logout", (req, res) => {
    res
      .clearCookie("token", {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .json({ success: true });
  });

  //  Doctor Routes ────────────────────────
  app.get("/doctors", async (req, res) => {
    try {
      const { search } = req.query;
      const filter = search
        ? { name: { $regex: search, $options: "i" } }
        : {};
      const doctors = await Doctor.find(filter);
      res.json(doctors);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/doctors/top", async (req, res) => {
    try {
      const doctors = await Doctor.find().sort({ rating: -1 }).limit(3);
      res.json(doctors);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/doctors/:id", async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });
      res.json(doctor);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // seed route — run once then you can remove it
  app.post("/seed-doctors", async (req, res) => {
    try {
      await Doctor.deleteMany({});
      const doctors = [
        {
          name: "Dr. Ayesha Rahman",
          specialty: "Cardiologist",
        image: "https://i.postimg.cc/2ynVsDdZ/Gemini-Generated-Image-eba1yweba1yweba1.png",
          experience: "10 years",
          availability: ["09:00 AM - 12:00 PM", "04:00 PM - 07:00 PM"],
          description:
            "Highly experienced cardiologist specializing in heart diseases, preventive care, and patient-centered treatment. She has helped thousands of patients lead healthier lives through accurate diagnosis and compassionate care.",
          hospital: "Labaid Cardiac Hospital",
          location: "Dhanmondi, Dhaka",
          fee: 800,
          rating: 4.9,
          totalReviews: 124,
        },
        {
          name: "Dr. Tariq Hossain",
          specialty: "Neurologist",
      image: "https://i.postimg.cc/23pSGXPY/download-(2).jpg",
          experience: "8 years",
          availability: ["10:00 AM - 01:00 PM", "05:00 PM - 08:00 PM"],
          description:
            "Specialist in neurological disorders including migraines, epilepsy, and stroke rehabilitation. Known for his thorough diagnostic approach and patient-first philosophy.",
          hospital: "Square Hospital",
          location: "West Panthapath, Dhaka",
          fee: 1000,
          rating: 4.7,
          totalReviews: 89,
        },
        {
          name: "Dr. Nadia Chowdhury",
          specialty: "Dermatologist",
        image: "https://i.postimg.cc/ZqqvCXZt/HPV-Surjer-Hashi-Clinic-012-JPG.jpg",
          availability: ["11:00 AM - 02:00 PM", "06:00 PM - 09:00 PM"],
          description:
            "Expert in skin care, acne treatment, cosmetic dermatology, and chronic skin conditions. Passionate about helping patients achieve confidence through healthy skin.",
          hospital: "United Hospital",
          location: "Gulshan, Dhaka",
          fee: 700,
          rating: 4.8,
          totalReviews: 102,
        },
        {
          name: "Dr. Kamal Uddin",
          specialty: "Orthopedic Surgeon",
        image: "https://i.postimg.cc/vZt51WVc/download-(1).jpg",
          experience: "15 years",
          availability: ["08:00 AM - 11:00 AM", "03:00 PM - 06:00 PM"],
          description:
            "Senior orthopedic surgeon with expertise in joint replacements, sports injuries, and spinal disorders. Has performed over 2000 successful surgeries.",
          hospital: "Evercare Hospital",
          location: "Bashundhara, Dhaka",
          fee: 1200,
          rating: 4.6,
          totalReviews: 78,
        },
        {
          name: "Dr. Sadia Islam",
          specialty: "Pediatrician",
  image: "https://i.postimg.cc/DZ8GYHY6/download.jpg",
          experience: "7 years",
          availability: ["09:00 AM - 01:00 PM", "04:00 PM - 07:00 PM"],
          description:
            "Dedicated pediatrician providing comprehensive healthcare for children from newborns to teenagers. Known for her warm approach that puts children and parents at ease.",
          hospital: "Dhaka Children Hospital",
          location: "Sher-e-Bangla Nagar, Dhaka",
          fee: 600,
          rating: 4.9,
          totalReviews: 156,
        },
        {
          name: "Dr. Rafiqul Islam",
          specialty: "Gastroenterologist",
  image: "https://i.postimg.cc/c4q3XD7H/images.jpg",
          experience: "12 years",
          availability: ["10:00 AM - 01:00 PM", "05:00 PM - 08:00 PM"],
          description:
            "Specialist in digestive system disorders including IBS, liver disease, and endoscopic procedures. Known for his evidence-based treatment approach.",
          hospital: "BIRDEM General Hospital",
          location: "Shahbag, Dhaka",
          fee: 900,
          rating: 4.5,
          totalReviews: 65,
        },
        {
          name: "Dr. Tanvir Ahmed",
          specialty: "Ophthalmologist",
          image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500",
          experience: "9 years",
          availability: ["09:00 AM - 12:00 PM", "05:00 PM - 08:00 PM"],
          description: "Expert in vision correction therapies, cataract micro-surgeries, and comprehensive management of advanced glaucoma conditions.",
          hospital: "Bangladesh Eye Hospital",
          location: "Dhanmondi, Dhaka",
          fee: 800,
          rating: 4.7,
          totalReviews: 94,
        },
        {
          name: "Dr. Nusrat Jahan",
          specialty: "Gynecologist",
          image: "https://i.postimg.cc/W321zHZR/download-(3).jpg",
          experience: "11 years",
          availability: ["10:00 AM - 02:00 PM", "04:00 PM - 07:00 PM"],
          description: "Specializing in maternal-fetal medicine, high-risk pregnancy care management, and minimally invasive reproductive health surgeries.",
          hospital: "Square Hospital",
          location: "West Panthapath, Dhaka",
          fee: 1000,
          rating: 4.9,
          totalReviews: 210,
        },
        {
          name: "Dr. Asif Rahman",
          specialty: "Endocrinologist",
          image: "https://i.postimg.cc/wBk9CQGF/images-(1).jpg",
          experience: "14 years",
          availability: ["11:00 AM - 03:00 PM", "06:00 PM - 09:00 PM"],
          description: "Focused on clinical thyroid disorders, metabolic syndromes, complex hormone balances, and advanced type-1 and type-2 diabetes management.",
          hospital: "Ibrahim General Hospital",
          location: "Shahbag, Dhaka",
          fee: 900,
          rating: 4.6,
          totalReviews: 82,
        },
        {
          name: "Dr. Mehnaz Choudhury",
          specialty: "Psychiatrist",
          image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=500",
          experience: "6 years",
          availability: ["03:00 PM - 07:00 PM"],
          description: "Dedicated to adult mental health psychotherapy, anxiety and panic tracking, mood regulation care, and clinical stress counseling support.",
          hospital: "National Institute of Mental Health",
          location: "Shyamoli, Dhaka",
          fee: 700,
          rating: 4.8,
          totalReviews: 115,
        },
        {
          name: "Dr. Rezwanul Haque",
          specialty: "Urologist",
          image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500",
          experience: "13 years",
          availability: ["09:00 AM - 01:00 PM", "05:00 PM - 08:00 PM"],
          description: "Specialist dealing in kidney stone removals, robotic prostate operations, and urinary tract infections with advanced diagnostic testing.",
          hospital: "Central Hospital",
          location: "Green Road, Dhaka",
          fee: 800,
          rating: 4.5,
          totalReviews: 73,
        },
        {
          name: "Dr. Farhana Yasmin",
          specialty: "ENT Specialist",
          image: "https://i.postimg.cc/7hj43s5w/download-(4).jpg",
          experience: "8 years",
          availability: ["10:00 AM - 01:00 PM", "04:00 PM - 07:00 PM"],
          description: "Expert therapeutic treatment for chronic sinusitis, balance and ear vertigo issues, vocal cord structures, and pediatric tonsillitis tracking.",
          hospital: "Anwer Khan Modern Hospital",
          location: "Dhanmondi, Dhaka",
          fee: 800,
          rating: 4.7,
          totalReviews: 91,
        },
        {
          name: "Dr. Sajjad Hossain",
          specialty: "Nephrologist",
          image: "https://images.unsplash.com/photo-1637059824899-a441006a6875?w=500",
          experience: "10 years",
          availability: ["11:00 AM - 02:00 PM", "06:00 PM - 09:00 PM"],
          description: "Specialized focus on chronic kidney disease progression tracking, clinical dialysis solutions, renal health nutrition, and hypertension control.",
          hospital: "Popular Diagnostic Center",
          location: "Dhanmondi, Dhaka",
          fee: 700,
          rating: 4.6,
          totalReviews: 64,
        },
        {
          name: "Dr. Samia Zaman",
          specialty: "Rheumatologist",
          image: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=500",
          experience: "7 years",
          availability: ["01:00 PM - 05:00 PM"],
          description: "Expert diagnostics regarding rheumatoid arthritis, systemic lupus configurations, chronic osteoarthritis care, and immune tissue disorders.",
          hospital: "Green Life Hospital",
          location: "Green Road, Dhaka",
          fee: 800,
          rating: 4.8,
          totalReviews: 87,
        },
        {
          name: "Dr. Mahbub Alam",
          specialty: "Pulmonologist",
          image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500",
          experience: "12 years",
          availability: ["09:00 AM - 12:00 PM", "05:00 PM - 08:00 PM"],
          description: "Focused clinic treatments covering structural asthma diseases, allergy indicators, sleep apnea disruptions, and chronic respiratory disorders.",
          hospital: "Asgar Ali Hospital",
          location: "Gendaria, Dhaka",
          fee: 1000,
          rating: 4.7,
          totalReviews: 109,
        },
        {
          name: "Dr. Fahmida Nabi",
          specialty: "Oncologist",
          image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=500",
          experience: "16 years",
          availability: ["10:00 AM - 01:00 PM", "03:00 PM - 06:00 PM"],
          description: "Dedicated to clinical cancer immunotherapy, targeted drug regiments, chemotherapy administration control, and compassionate patient support.",
          hospital: "Ahsania Mission Cancer Hospital",
          location: "Uttara, Dhaka",
          fee: 1500,
          rating: 4.9,
          totalReviews: 143,
        },
      ];
      await Doctor.insertMany(doctors);
      res.json({ message: "Doctors seeded successfully", count: doctors.length });
    } catch (err) {
      res.status(500).json({ message: "Seed failed", error: err.message });
    }
  });

  // ── Appointment Routes ────────────────────────────────────────
  app.post("/appointments", verifyToken, async (req, res) => {
    try {
      const appointment = new Appointment(req.body);
      const result = await appointment.save();
      res.status(201).json(result);
    } catch {
      res.status(500).json({ message: "Booking failed" });
    }
  });

  app.get("/appointments/my", verifyToken, async (req, res) => {
    try {
      if (req.user.email !== req.query.email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const appointments = await Appointment.find({ userEmail: req.query.email })
        .sort({ createdAt: -1 });
      res.json(appointments);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/appointments/:id", verifyToken, async (req, res) => {
    try {
      const updated = await Appointment.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Update failed" });
    }
  });

  app.delete("/appointments/:id", verifyToken, async (req, res) => {
    try {
      await Appointment.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Delete failed" });
    }
  });

  // ── Review Routes ─────────────────────────────────────────────
  app.get("/reviews/:doctorId", async (req, res) => {
    try {
      const reviews = await Review.find({ doctorId: req.params.doctorId })
        .sort({ createdAt: -1 });
      res.json(reviews);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/reviews", verifyToken, async (req, res) => {
    try {
      const review = new Review(req.body);
      await review.save();
      // update doctor's review count
      await Doctor.findByIdAndUpdate(req.body.doctorId, {
        $inc: { totalReviews: 1 },
      });
      res.status(201).json(review);
    } catch {
      res.status(500).json({ message: "Review failed" });
    }
  });

  // ── Health check ──────────────────────────────────────────────
  app.get("/", (req, res) => res.send("DocAppoint Server Running ✅"));

  app.listen(PORT, () =>
    console.log(`🚀  Server running on http://localhost:${PORT}`)
  );