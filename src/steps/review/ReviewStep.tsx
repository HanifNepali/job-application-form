import { useFormStore } from "@/store/formStore";
import { useFileStore } from "@/store/fileStore";
import { SummarySection } from "@/components/SummarySection";
import { SummaryRow } from "@/components/SummaryRow";
import { ChipList } from "@/components/ChipList";
import { STEPS, validateAllSteps } from "@/lib/steps";
import { Fragment } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, type ReviewData } from "./schema";
import { FieldCheckbox } from "@/components/FieldCheckbox";
import { Button } from "@/components/Button";
import { useNavigate } from "react-router-dom";
import { StepHeader } from "@/components/StepHeader";
import { countryLabel, regionLabels } from "@/lib/utils";
import { useState } from "react";
import { ResetConfirmModal } from "@/components/ResetConfirmationModal";

export function ReviewStep() {
  const data = useFormStore((s) => s.data);
  const resume = useFileStore((s) => s.resume);
  const coverLetter = useFileStore((s) => s.coverLetter);
  const { personalInfo, experience, skillsLinks, availability } = data;
  const updateReview = useFormStore((s) => s.updateReview);
  const navigate = useNavigate();
  const resetForm = useFormStore((s) => s.reset);
  const resetFiles = useFileStore((s) => s.reset);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: data.review,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = (values: ReviewData) => {
    const { isValid, firstInvalidStepPath } = validateAllSteps(data, {
      resume,
      coverLetter,
    });

    if (!isValid && firstInvalidStepPath) {
      navigate(firstInvalidStepPath);
      return;
    }

    updateReview(values);
    // final re-validation + fake async submit goes here — next piece
    alert("Application submitted successfully!"); // placeholder — see below
  };

  const handleConfirmReset = () => {
    resetForm();
    resetFiles();
    setIsResetOpen(false);
    navigate(`/form/${STEPS[0].path}`);
  };

  return (
    <>
      <StepHeader title={STEPS[5].label} description={STEPS[5].pageSubHeader} />

      <div className="space-y-6">
        <SummarySection
          title="Personal Info"
          editPath={`/form/${STEPS[0].path}`}
        >
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

        <SummarySection
          title="Availability"
          editPath={`/form/${STEPS[4].path}`}
        >
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

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldCheckbox
            label="I agree to the Terms & Conditions"
            error={errors.termsAccepted?.message}
            {...register("termsAccepted")}
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="destructive" onClick={() => setIsResetOpen(true)}>
              Clear All Form Data
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Submit Application
            </Button>
          </div>
        </form>

        {/* This modal uses data-autofocus on "Keep Editing" button */}
        <ResetConfirmModal
          isOpen={isResetOpen}
          onCancel={() => setIsResetOpen(false)}
          onConfirm={handleConfirmReset}
        />
      </div>
    </>
  );
}
