import React from 'react'
import Hero from '../components/Home/Hero.jsx'
import ServicesPreview from '../components/Home/ServicesPreview.jsx'
import ProjectsPreview from '../components/Home/ProjectsPreview.jsx'
import Reviews from '../components/Home/Reviews.jsx'

const Home = () => {
  return <>
    <Hero />
    <ServicesPreview />
    <ProjectsPreview />
    <Reviews />
  </>

}

export default Home