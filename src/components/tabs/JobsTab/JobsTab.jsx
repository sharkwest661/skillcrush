import React from "react";
import { useGameStore } from "../../../stores/gameStore";
import styles from "./JobsTab.module.scss";

const JobsTab = () => {
  const { player, setCurrentJob } = useGameStore();

  // Sample jobs for demonstration
  const sampleJobs = [
    {
      id: 1,
      title: "Junior Frontend Developer",
      company: "TechStart Inc.",
      salary: 45000,
      location: "Remote",
      requirements: ["HTML", "CSS", "JavaScript"],
      description: "Build responsive web interfaces for our startup.",
      type: "Full-time",
    },
    {
      id: 2,
      title: "Web Developer Intern",
      company: "Digital Agency",
      salary: 35000,
      location: "New York, NY",
      requirements: ["HTML", "CSS"],
      description:
        "Learn web development while contributing to client projects.",
      type: "Internship",
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "Enterprise Corp",
      salary: 75000,
      location: "San Francisco, CA",
      requirements: ["JavaScript", "React", "Node.js", "SQL"],
      description: "Develop and maintain full-stack web applications.",
      type: "Full-time",
    },
  ];

  const meetsRequirements = (requirements) => {
    return requirements.every((skill) => player.skills[skill]);
  };

  const getRequirementsMet = (requirements) => {
    return requirements.filter((skill) => player.skills[skill]).length;
  };

  const handleApply = (job) => {
    if (meetsRequirements(job.requirements)) {
      setCurrentJob(job);
      useGameStore.getState().addNotification({
        type: "success",
        title: "Job Accepted!",
        message: `You got the ${job.title} position at ${job.company}!`,
        duration: 3000,
      });
    } else {
      useGameStore.getState().addNotification({
        type: "error",
        title: "Application Rejected",
        message: "You don't meet all the requirements for this position.",
        duration: 3000,
      });
    }
  };

  return (
    <div className={styles.jobsTab}>
      <div className={styles.jobsHeader}>
        <h2>📋 Job Board</h2>
        <p>Find and apply for positions that match your skills!</p>
        {player.currentJob && (
          <div className={styles.currentJob}>
            <strong>Current Position:</strong> {player.currentJob.title} at{" "}
            {player.currentJob.company}
          </div>
        )}
      </div>

      <div className={styles.jobsGrid}>
        {sampleJobs.map((job) => {
          const requirementsMet = getRequirementsMet(job.requirements);
          const canApply = meetsRequirements(job.requirements);

          return (
            <div
              key={job.id}
              className={`${styles.jobCard} ${
                canApply ? styles.eligible : styles.notEligible
              }`}
            >
              <div className={styles.jobHeader}>
                <h3>{job.title}</h3>
                <div className={styles.jobCompany}>{job.company}</div>
                <div className={styles.jobSalary}>
                  ${job.salary.toLocaleString()}/year
                </div>
              </div>

              <div className={styles.jobDetails}>
                <div className={styles.jobLocation}>📍 {job.location}</div>
                <div className={styles.jobType}>⏰ {job.type}</div>
              </div>

              <p className={styles.jobDescription}>{job.description}</p>

              <div className={styles.jobRequirements}>
                <h4>Requirements:</h4>
                <div className={styles.skillsList}>
                  {job.requirements.map((skill) => (
                    <span
                      key={skill}
                      className={`${styles.skillTag} ${
                        player.skills[skill]
                          ? styles.skillMet
                          : styles.skillUnmet
                      }`}
                    >
                      {skill}
                      {player.skills[skill] ? " ✅" : " ❌"}
                    </span>
                  ))}
                </div>
                <div className={styles.requirementsProgress}>
                  {requirementsMet} of {job.requirements.length} requirements
                  met
                </div>
              </div>

              <button
                className={`${styles.applyButton} ${
                  canApply ? styles.canApply : styles.cantApply
                }`}
                onClick={() => handleApply(job)}
                disabled={!canApply}
              >
                {canApply ? "🎯 Apply Now" : "🔒 Requirements Not Met"}
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.jobAdvice}>
        <h3>💡 Job Hunting Tips</h3>
        <ul>
          <li>
            Learn basic skills like HTML, CSS, and JavaScript to unlock
            entry-level positions
          </li>
          <li>
            Don't worry if you don't meet every requirement - many companies
            hire based on potential
          </li>
          <li>
            Building a portfolio of projects can help compensate for missing
            skills
          </li>
          <li>Consider internships or junior positions to gain experience</li>
        </ul>
      </div>
    </div>
  );
};

export default JobsTab;
