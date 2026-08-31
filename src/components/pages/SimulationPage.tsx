import React from 'react';
import { HeroSection } from '@/components/simulation/features/HeroSection';
import { StatsBar } from '@/components/simulation/features/StatsBar';
import { SimulationsGrid } from '@/components/simulation/features/SimulationsGrid';
import { LearningRoadmap } from '@/components/simulation/features/LearningRoadmap';

export function SimulationPage() {
  return (
    <div className="space-y-6">
      <HeroSection />
      <StatsBar />
      <SimulationsGrid />
      <LearningRoadmap />
    </div>
  );
}

export default SimulationPage;
