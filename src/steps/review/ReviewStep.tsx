import { useFormStore } from "@/store/formStore";
import { useFileStore } from "@/store/fileStore";
import { SummarySection } from "@/components/SummarySection";
import { SummaryRow } from "@/components/SummaryRow";
import { ChipList } from "@/components/ChipList";
import { STEPS } from "@/lib/steps";
import { countryOptions } from "@/lib/utils";
import { RELOCATION_REGIONS } from "@/lib/constants";
import { Fragment } from "react/jsx-runtime";

function countryLabel(code: string): string {
  return countryOptions.find((c) => c.value === code)?.label ?? code;
}

function regionLabels(values: string[]): string {
  if (values.length === 0) return "";
  return values
    .map((v) => RELOCATION_REGIONS.find((r) => r.value === v)?.label ?? v)
    .join(", ");
}

export function ReviewStep() {
  const data = useFormStore((s) => s.data);
  const resume = useFileStore((s) => s.resume);
  const coverLetter = useFileStore((s) => s.coverLetter);

  const { personalInfo, experience, skillsLinks, availability } = data;

  return (
    <div className="space-y-6">
      <SummarySection title="Personal Info" editPath={`/form/${STEPS[0].path}`}>
        <SummaryRow
          label="Name"
          value={[
            personalInfo.firstName,
            personalInfo.middleName,
            personalInfo.lastName,
          ].join(" ")}
        />
        <SummaryRow label="Email" value={personalInfo.email} />
        <SummaryRow label="Phone" value={personalInfo.phone} />
        <SummaryRow
          label="Location"
          value={[personalInfo.city, countryLabel(personalInfo.country)].join(
            ", ",
          )}
        />
      </SummarySection>

      <SummarySection title="Experience" editPath={`/form/${STEPS[1].path}`}>
        <SummaryRow label="Current Role" value={experience.currentRole} />
        <SummaryRow
          label="Years of Experience"
          value={
            experience.yearsOfExperience !== null
              ? String(experience.yearsOfExperience)
              : ""
          }
        />
        {experience.pastRoles.length > 0 && (
          <div className="mt-6">
            <SummarySection title="Past Roles" allowEdit={false}>
              {experience.pastRoles.map((role, i) => (
                <Fragment key={role.id}>
                  <SummaryRow label="Company Name" value={role.company} />
                  <SummaryRow label="Role Title" value={role.title} />
                  <SummaryRow label="Start Date" value={role.startDate} />
                  <SummaryRow
                    label="End Date"
                    value={role.isCurrentRole ? "Present" : role.endDate}
                  />
                  {i < experience.pastRoles.length - 1 && (
                    <hr className="my-8 border-line" />
                  )}
                </Fragment>
              ))}
            </SummarySection>
          </div>
        )}
      </SummarySection>

      <SummarySection
        title="Skills & Links"
        editPath={`/form/${STEPS[2].path}`}
      >
        <SummaryRow
          label="Skills"
          value={
            skillsLinks.skills.length > 0 ? (
              <ChipList title="" items={skillsLinks.skills} />
            ) : (
              ""
            )
          }
        />
        <SummaryRow label="Portfolio URL" value={skillsLinks.portfolioUrl} />
        <SummaryRow label="GitHub URL" value={skillsLinks.githubUrl} />
        <SummaryRow label="LinkedIn URL" value={skillsLinks.linkedinUrl} />
      </SummarySection>

      <SummarySection title="Uploads" editPath={`/form/${STEPS[3].path}`}>
        <SummaryRow label="Resume" value={resume?.name ?? ""} />
        <SummaryRow label="Cover Letter" value={coverLetter?.name ?? ""} />
      </SummarySection>

      <SummarySection title="Availability" editPath={`/form/${STEPS[4].path}`}>
        <SummaryRow
          label="Residing in job location?"
          value={
            availability.residesInJobLocation === null
              ? ""
              : availability.residesInJobLocation
                ? "Yes"
                : "No"
          }
        />
        <SummaryRow
          label="Willing to relocate?"
          value={
            availability.willingToRelocate === null
              ? ""
              : availability.willingToRelocate
                ? "Yes"
                : "No"
          }
        />
        {availability.willingToRelocate && (
          <SummaryRow
            label="Preferred Regions"
            value={regionLabels(availability.relocationRegions)}
          />
        )}
        <SummaryRow
          label="Earliest Start Date"
          value={availability.earliestStartDate}
        />
      </SummarySection>
    </div>
  );
}
