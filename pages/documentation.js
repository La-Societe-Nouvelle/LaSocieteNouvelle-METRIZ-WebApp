import Head from 'next/head'
//import Header from '../src/components/header'
//import Footer from '../src/components/footer'

import fs from 'fs'

import unified from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';

import React from 'react'

export default async function Home() 
{
  const mdFile = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(html)
    .process(fs.readFileSync('./public/DOCUMENTATION.md'));
  const content = String(mdFile).replace(/href/g,'target="_blank" href');

  return (
    <div className="container">
      <Head>
        <title>La Société Nouvelle</title>
        <link rel="icon" href="/resources/logo_miniature.jpg" />
      </Head>
      
      {/*<Header/>*/}
      <main className="main">

        <div className="content-md" dangerouslySetInnerHTML={{__html: content}}/>

        <div className="strip">
          <p id="lien-github"><a href={"https://github.com/SylvainH-LSN/LaSocieteNouvelle-METRIZ-WebApp/blob/main/DOCUMENTATION.md"} target="_blanck">Proposer une amélioration de la page</a></p>
        </div>

      </main>
      {/*<Footer/>*/}
    </div>
  )
}