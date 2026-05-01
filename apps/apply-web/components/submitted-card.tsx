"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SubmittedCard() {
  const [secondsLeft, setSecondsLeft] = useState(6);

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(countdown);
          window.location.assign("/forms");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(countdown);
  }, []);

  return (
    <div className="card stack submitted-card">
      <div className="tag">Submitted</div>
      <h1 className="page-title">Your application has been sent</h1>
      <p className="page-copy">
        Your submission was received successfully. You will be redirected back
        to the forms overview shortly.
      </p>
      <div className="submitted-card__highlights">
        <div className="notice">
          You can already track the status in <strong>My Applications</strong>.
        </div>
        <div className="notice">
          If your profile details change later, you can update them in
          <strong> My Profile</strong>.
        </div>
      </div>
      <div className="notice">
        Redirecting in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}.
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <Link className="button button--primary" href="/forms">
          Back to Forms
        </Link>
        <Link className="button button--secondary" href="/applications">
          My Applications
        </Link>
      </div>
    </div>
  );
}
