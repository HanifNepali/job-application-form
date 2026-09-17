import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { useFormStore } from "@/store/formStore";
import { STEPS } from "@/lib/steps";
import { motion } from "motion/react";
import { useFadeUp, useStagger } from "@/lib/motionVariants";
import { landingContent } from "@/lib/landing";

export function LandingPage() {
  const navigate = useNavigate();
  const furthestUnlockedStep = useFormStore((s) => s.furthestUnlockedStep);

  const handleGoToForm = () => {
    navigate(`/form/${STEPS[furthestUnlockedStep].path}`);
  };

  const container = useStagger({ staggerChildren: 0.25 });
  const item = useFadeUp({ duration: 0.5, yOffset: 25 });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6">
      <div className="grid xl:grid-cols-3 gap-6 xl:gap-12 mt-12 xl:mt-0">
        {/* Col-1 */}
        <motion.section
          className="xl:max-w-130 xl-mr-auto space-y-6 mb-10 xl:mb-0"
          initial="hidden"
          animate="visible"
          variants={container}
        >
          <motion.h1
            variants={item}
            className="font-serif text-4xl font-semibold text-ink mb-15 tracking-tight"
          >
            Multi-Step <br /> Job Application Form
          </motion.h1>

          <motion.div variants={item} className="mb-6">
            <h2 className="mb-5 font-serif text-xl font-semibold text-ink">
              {landingContent.overview.heading}
            </h2>
            <p className="text-ink-secondary mb-6">
              {landingContent.overview.paragraph}
            </p>

            <p className="text-ink-secondary mb-6">
              {landingContent.detail.paragraphTop}
            </p>

            <p className="text-ink-secondary">
              {landingContent.detail.paragraphBottom}
            </p>
          </motion.div>

          <motion.div variants={item}>
            <h3 className="mb-2 text-sm text-ink-secondary">
              {furthestUnlockedStep === 0
                ? "Ready to Start?"
                : "Continue where you left off?"}
            </h3>
            <Button
              variant="primary"
              onClick={handleGoToForm}
              className="min-w-35"
            >
              Go to Form
            </Button>
          </motion.div>
        </motion.section>

        {/* Col-2 */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={container}
          className="xl:max-w-100 xl:mx-auto space-y-10 xl:space-y-15 mb-10 xl:mb-0"
        >
          <motion.h2
            variants={item}
            className="mb-5 font-serif text-xl font-semibold text-ink"
          >
            {landingContent.techStack.heading}
          </motion.h2>
          <motion.ul variants={item} className="space-y-3">
            {landingContent.techStack.items.map((tech) => (
              <li key={tech.name}>
                <span className="text-ink block mb-1 text-[15px]">
                  {tech.name}
                </span>
              </li>
            ))}
          </motion.ul>
          <motion.h2
            variants={item}
            className="mb-5 font-serif text-xl font-semibold text-ink"
          >
            {landingContent.accessibility.heading}
          </motion.h2>
          <motion.ul variants={item} className=" space-y-4 pl-4 list-disc">
            {landingContent.accessibility.items.map((point) => (
              <li key={point} className="text-ink-secondary">
                {point}
              </li>
            ))}
          </motion.ul>
        </motion.section>

        {/* Col-3 */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="visible"
          className="xl:max-w-120 space-y-8"
        >
          <motion.h2
            variants={item}
            className="mb-5 font-serif text-xl font-semibold text-ink"
          >
            {landingContent.decisions.heading}
          </motion.h2>
          <motion.ul variants={item} className="space-y-6 pl-4 list-disc">
            {landingContent.decisions.items.map((decision) => (
              <li key={decision.title} className="text-ink-secondary">
                <span className="font-medium text-ink block mb-2">
                  {decision.title}
                </span>
                <span className="block">{decision.description}</span>
              </li>
            ))}
          </motion.ul>
        </motion.section>
      </div>
    </div>
  );
}
