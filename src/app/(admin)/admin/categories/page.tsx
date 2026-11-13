import { Navbar } from '@/components/shared/NavBar'
import { Main } from '@/components/ui/main'
import React from 'react'
import AllCategories from './components/AllCategories'

const CategoriesPage = () => {
  return (
    <>
      <Navbar fixed />
      <Main>
        <AllCategories />
      </Main>
    </>
  )
}

export default CategoriesPage
