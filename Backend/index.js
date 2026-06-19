require("dotenv").config()
const { startMedicationReminderJob } = require('./jobs/medicationReminder.job')
const { startAppointmentReminderJob } = require('./jobs/appointmentReminder.job')
const { startRefillReminderJob } = require('./jobs/refillReminder.job')
const drugInteractionRouter = require("./route/drugInteraction.route")
const familyMemberRouter = require("./route/familyMember.route")
const passport = require("./services/passport")

const express = require("express")
const app = express()

const connect = require("./database/db.connect")

console.log("Before requiring router");
const userrouter = require("./route/user.route")
const medicationRouter = require("./route/medication.route")
const healthMetricRouter = require("./route/healthMetric.route")
const appointmentRouter = require("./route/appointment.route")
const pillTrackingRouter = require("./route/pillTracking.route")
const symptomRouter = require("./route/symptom.route")
const userTokenRouter = require("./route/userToken.route")  // Add this line
console.log("After requiring router");

const cors = require("cors")

// middleware
app.use(cors({origin: "*"})) 
app.use(express.json({limit: "50mb"}))
app.use("/user", userrouter)
app.use("/medications", medicationRouter)
app.use("/health-metrics", healthMetricRouter)
app.use("/appointments", appointmentRouter)
app.use("/pill-tracking", pillTrackingRouter)
app.use("/symptoms", symptomRouter)
app.use("/user-token", userTokenRouter) 
app.use("/drug-interactions", drugInteractionRouter)
app.use("/family-members", familyMemberRouter) 
app.use(passport.initialize())

// Start medication reminder cron job
startMedicationReminderJob()

// Start appointment reminder cron job
startAppointmentReminderJob()  // Add this line

// Start refill reminder cron job
startRefillReminderJob()  // Add this line

connect()
const port = 8007

app.listen(port, () => {
    console.log(`App started listening at port ${port}`);
})