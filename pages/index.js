// La Société Nouvelle

// React / Next
import React from "react";
import Head from "next/head";
import { BrowserView, MobileView } from "react-device-detect";
import { Mobile } from "/src/components/Mobile";

import { Metriz } from "/src/Metriz";

/*   _________________________________________________________________________________________________________
 *  |                                                                                                         |
 *  |   _-_ _-_- -_-_                                                                                         |
 *  |   -\-_\/-_-_/_-                                                                                         |
 *  |    -|_ \  / '-                  ___   __   __ .  __  ___  __          __               __          __   |
 *  |    _-\_-|/  _ /    |     /\    |     |  | |   | |     |  |     |\  | |  | |  | \    / |   |   |   |     |
 *  |        ||    |     |    /__\   |---| |  | |   | |-    |  |-    | \ | |  | |  |  \  /  |-  |   |   |-    |
 *  |       _||_  /'\    |__ /    \   ___| |__| |__ | |__   |  |__   |  \| |__| |__|   \/   |__ |__ |__ |__   |
 *  |                                                                                                         |
 *  |                                                                             Let's change the world...   |
 *  |_________________________________________________________________________________________________________|
 */

/* -------------------------------------------------------------------------------------- */
/* ---------------------------------------- HOME ---------------------------------------- */
/* -------------------------------------------------------------------------------------- */

export default function Home() {
  return (
    <>
      <Head>
        <title>METRIZ by La Société Nouvelle</title>
        <meta
          name="description"
          content="Metriz est une application web libre et open source qui vous permet de faire le lien entre vos données comptables, les empreintes sociétales de vos fournisseurs et vos impacts directs."
        />
        <meta property="og:title" content="Metriz by La Société Nouvelle" />
        <meta
          property="og:description"
          content="Metriz est une application web libre et open source qui vous permet de faire le lien entre vos données comptables, les empreintes sociétales de vos fournisseurs et vos impacts directs."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://metriz.lasocietenouvelle.org"
        />
        <meta property="og:image" content="/metriz_illus.jpg" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BrowserView>
        <Metriz />
      </BrowserView>
      <MobileView>
        <Mobile />
      </MobileView>
    </>
  );
}

