import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "../../../../components/app-shell";
import { PartnershipRequestForm } from "../../../../components/forms/partnership-request-form";
import { PlaceholderForm } from "../../../../components/forms/placeholder-form";
import { PremierApplicationForm } from "../../../../components/forms/premier-application-form";
import { RoleApplicationForm } from "../../../../components/forms/role-application-form";
import { TeamApplicationForm } from "../../../../components/forms/team-application-form";
import { TournamentJoinForm } from "../../../../components/forms/tournament-join-form";
import { getCategoryById, getSubtypeById } from "../../../../lib/kova-forms";

export default async function SubtypePage({
  params,
}: {
  params: Promise<{ category: string; subtype: string }>;
}) {
  const { category, subtype } = await params;
  const categoryData = getCategoryById(category);
  const subtypeData = getSubtypeById(category, subtype);

  if (!categoryData || !subtypeData) {
    notFound();
  }

  let content: React.ReactNode;
  const intro = (
    <section className="page-header page-header--narrow">
      <div className="page-header__row">
        <div className="tag">{categoryData.title}</div>
        <Link href={`/forms/${categoryData.id}`} className="tag tag--action">
          Back
        </Link>
      </div>
      <h1 className="page-title">{subtypeData.title}</h1>
      <p className="page-copy">{subtypeData.description}</p>
    </section>
  );

  if (category === "competitive" && subtype === "main_team_or_academy") {
    content = <TeamApplicationForm />;
  } else if (category === "competitive" && subtype === "premier") {
    content = <PremierApplicationForm />;
  } else if (category === "competitive" && subtype === "tournament") {
    content = <TournamentJoinForm />;
  } else if (category === "staff" && subtype === "moderator") {
    content = (
      <RoleApplicationForm
        category="staff"
        subtype="moderator"
        title="Moderator Application"
        intro="Apply for moderation and community oversight responsibilities across KOVA spaces."
        focusAreas={["moderation", "community safety", "ticket handling"]}
      />
    );
  } else if (category === "staff" && subtype === "coach") {
    content = (
      <RoleApplicationForm
        category="staff"
        subtype="coach"
        title="Coach Application"
        intro="Apply to help KOVA players and rosters improve through coaching, review, and structure."
        focusAreas={["coaching", "vod review", "player development"]}
      />
    );
  } else if (category === "staff" && subtype === "team_manager") {
    content = (
      <RoleApplicationForm
        category="staff"
        subtype="team_manager"
        title="Team Manager Application"
        intro="Apply to support active KOVA rosters with organization, logistics, and daily coordination."
        focusAreas={["operations", "team management", "scheduling"]}
      />
    );
  } else if (category === "community" && subtype === "community_support") {
    content = (
      <RoleApplicationForm
        category="community"
        subtype="community_support"
        title="Community Support Application"
        intro="Apply to welcome members, answer common questions, and help keep KOVA's community spaces active, helpful, and easy to navigate."
        focusAreas={["member support", "community presence", "engagement"]}
        requireAgeCheck
        agePrompt="18+ Confirmation"
        ageHint="Write yes or no. This role may involve responsibility in public-facing community situations."
      />
    );
  } else if (category === "community" && subtype === "event_staff") {
    content = (
      <RoleApplicationForm
        category="community"
        subtype="event_staff"
        title="Event Staff / Helper Application"
        intro="Apply to support KOVA community events, match-day activity, and event operations when hands-on help is needed."
        focusAreas={["event support", "community activity", "coordination"]}
        requireAgeCheck
        agePrompt="18+ Confirmation"
        ageHint="Write yes or no. This role can involve responsibility during organized KOVA events."
      />
    );
  } else if (category === "community" && subtype === "partnership_staff") {
    content = (
      <RoleApplicationForm
        category="community"
        subtype="partnership_staff"
        title="Partnership Staff Application"
        intro="Apply to help with outreach, relationship-building, and communication around partners and collaboration opportunities."
        focusAreas={["outreach", "partner communication", "brand relationships"]}
        requireAgeCheck
        agePrompt="18+ Confirmation"
        ageHint="Write yes or no. Partnership-facing work may require a mature and professional point of contact."
      />
    );
  } else if (category === "creative" && subtype === "video_editor") {
    content = (
      <RoleApplicationForm
        category="creative"
        subtype="video_editor"
        title="Video Editor Application"
        intro="Apply to create edited content for KOVA through recaps, highlights, announcements, and social-focused videos."
        focusAreas={["video editing", "content packaging", "storytelling"]}
      />
    );
  } else if (category === "creative" && subtype === "social_media") {
    content = (
      <RoleApplicationForm
        category="creative"
        subtype="social_media"
        title="Social Media Application"
        intro="Apply to help shape KOVA's public voice through planning, posting, and audience-focused content support."
        focusAreas={["social media", "content planning", "audience engagement"]}
      />
    );
  } else if (
    category === "partnerships" &&
    subtype === "partnership_request"
  ) {
    content = <PartnershipRequestForm />;
  } else {
    content = (
      <PlaceholderForm
        title={subtypeData.title}
        description={subtypeData.description}
      />
    );
  }

  return (
    <AppShell>
      {intro}
      {content}
    </AppShell>
  );
}
