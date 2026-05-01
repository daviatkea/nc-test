# Eksamensopgave: Night Club

Copenhagen Night Life Entertainment er en virksomhed i underholdningsindustrien. Firmaet er i gang med en relancering af deres flagskib **Night Club**, som er placeret centralt i København.

Relanceringen er blandt andet bundet op på klubbens nye website. Sitets visuelle retning, stemning og grundstruktur er fastlagt af kunden, men den endelige frontend skal udvikles af jer. Jeres opgave er at kode og programmere sitets opsætning, visning af indhold, formularer og interaktive funktionalitet.

Night Club skal fungere som et moderne event- og bookingwebsite, hvor besøgende kan opdage kommende events, læse mere om det enkelte event, kommentere på events, reservere bord, tilmelde sig nyhedsbrev og kontakte klubben.

## Tekniske Krav

Sitet skal som minimum være opbygget med HTML, CSS og JavaScript. I må gerne anvende et framework eller andre værktøjer, så længe de bygger på disse teknologier.

Der skal implementeres fejlhåndtering for alle relevante fejl, så brugeren får en fejlmeddelelse, der giver mening i den konkrete kontekst. Brugeren skal ikke præsenteres for tekniske interne fejlbeskeder.

Dårligt eksempel:

```txt
Input validation error: 400 Bad Request.
```

Godt eksempel:

```txt
Indtast venligst en gyldig e-mail, så vi kan sende dig nyhedsbrevet.
```

Der skal være fallback-UI for data eller indhold, der er ved at blive hentet. Alle formularer og inputelementer bør valideres client-side (frontend), inden data sendes til API’et, for at give live feedback og forbedre brugeroplevelsen. Validering skal som minimum implementeres på serversiden (fx. med Zod). API’et validerer også data, og frontenden skal kunne håndtere og præsentere eventuelle fejlbeskeder korrekt.

## Arbejde Med API'et

Sitet skal køre op mod et API, hvor I både kan hente indholdsdata med `GET` og sende brugerdata med `POST`.

Når I har hentet API-projektet og åbnet det i Visual Studio Code, skal I gøre følgende:

```bash
npm install
npm start
```

Når API'et kører lokalt, er det tilgængeligt på: 

```txt
http://localhost:4000
```

Hvis I bruger Next.js og henter billeder fra det lokale API med `next/image`, skal `next.config.js` tillade billeder fra `localhost`. Under lokal udvikling kan konfigurationen fx se sådan ud:

```js
images: {
  dangerouslyAllowLocalIP: true,
  remotePatterns: [
    {
      protocol: "http",
      hostname: "localhost",
      port: "4000",
      pathname: "/**",
    },
  ],
},
```

`dangerouslyAllowLocalIP: true` skal kun bruges under lokal udvikling. Når API'et flyttes til Render, skal den fjernes, og `remotePatterns` skal i stedet pege på Render-serverens hostname.

Læs API-dokumentationen i [README.md](./README.md).

Til aflevering skal API'et deployes til en fjernserver, så jeres frontend kan afprøves uden en lokal backend. Se [REMOTESERVER.md](./REMOTESERVER.md).

### Centrale Endpoints

I skal som minimum arbejde med disse endpoints:

```txt
GET /events
GET /events/:id
GET /events/:slug
GET /events/:id?_embed=comments
GET /comments?eventId=:id
POST /comments
GET /gallery
GET /testimonials
GET /reservations
GET /reservations?eventId=:id
POST /reservations
POST /contact_messages
POST /newsletters
```

Events er read-only i API'et. Det betyder, at events kun kan hentes med `GET`.

Kommentarer er knyttet til events via `eventId`. En event-detail-side skal derfor kunne hente kommentarer til det aktuelle event og sende nye kommentarer til API'et.

Reservationer sendes til `POST /reservations`. Ved booking til et event skal reservationen indeholde `eventId`, og reservationsdatoen skal matche eventets dato.

## Kravspecifikation

Designet findes i en Figma-fil under ressourcer på ItsLearning. Der er udleveret en assets-mappe med logoer, billeder og øvrigt visuelt materiale til projektet. **Der kan forekomme mangler i assets eller ufuldstændige elementer.** Dette afspejler ofte virkelige arbejdssituationer, hvor materialer ikke altid er fuldt tilgængelige fra start.

På den baggrund vurderes gruppens evne til at træffe professionelle og velovervejede beslutninger om, hvordan mangler håndteres. Det kan eksempelvis være valg af alternative materialer, brug af billeder fra API'et eller implementering af logo/ikoner via et ikonbibliotek, hvis det giver en mere fleksibel løsning.

I må gerne udfordre designet og lave mindre justeringer, hvis det styrker UI-konventioner, best practice og brugervenlighed. Der er dog ikke tale om et redesign, og løsningen skal som udgangspunkt følge det eksisterende design.

## Generelle Krav

Sitet skal bygges efter layoutet og den visuelle retning i designmaterialet.

Sitet skal være responsivt, og det er **vigtigt**, at både små og store skærme testes grundigt. Husk helt store skærme, som kan simuleres ved at zoome ud i browseren.

Alle interaktive elementer skal have tydelige fokus-states, så sitet også kan bruges med tastatur. Fokus-states skal passe til det mørke visuelle design og være lette at se på links, knapper, formularfelter og andre klikbare elementer.

Egne farver i CSS skal være i `oklch()`-format og ikke HEX (`#FF2A70`). Det gør farverne mere forudsigelige at justere og gør det lettere at lave brugbare hover-nuancer, som I nok bør have.

Projektet skal udvikles i et fælles repository, hvor gruppen arbejder sammen om udviklingen. Der skal etableres et klart workflow med `stage`, `commit` og `push`, så udviklingsprocessen kan følges gennem meningsfulde og præcise commit-beskeder.

Et commit skal repræsentere én afgrænset feature eller ændring ad gangen. Undgå at samle flere urelaterede ændringer i samme commit.

Gruppen skal desuden vælge og anvende en branching-strategi, fx feature branches, så arbejdet kan organiseres og merges på en struktureret måde.

## Hovednavigation

Navigationsbaren findes øverst på alle sider. På forsiden kan navigationen være placeret i bunden af hero-sektionen ved page-load, hvorefter den bliver sticky ved scroll.

Navigationsbaren indeholder logo og følgende menupunkter:

```txt
Home
Events
Book Table
Contact Us
```

Aktive punkter skal vises i pink og med en pink streg under (Hint: router). Ved hover skal menupunktets tekst rulle lodret fra hvid til pink, mens den pink streg glider ind under det aktive link.

- Se ressourcer for demo.

**OBS!** Burgermenuen _skal_ implementeres med [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).

## Footer

Nederst på alle views skal der være en footer. Den indeholder logo, åbningstider, adresse, SoMe-ikoner og copyright-info.

## Forside

Forsiden er Night Club’s landingpage. Formålet er at vise små bidder af indhold, der giver besøgende en idé om hvad Night Club er og kan tilbyde.

### Hero

I toppen af forsiden er en hero. Den er fuldskærm og har to baggrundsbilleder, som der skiftes imellem tilfældigt for hvert page-load.

Centreret på hero er Night Club's logo og tagline:

```txt
Have a good time
```

Logo og tagline animeres ved page-load\*, således at Logoet først bliver synligt (fold in animation), og derefter dropper tagline frem under logoet.

I bunden af Hero ligger applikationens hoved-navigation. Når en besøgende scroller længere ned på siden, følger hoved-navigationsbaren med op, indtil den støder på toppen af viewporten. Her skal den efterfølgende blive.

 \*Se ressourcer for demo på ItsLearning.

### Sektion 1: Welcome To Night Club

Denne sektion præsenterer kort de tre hovedtilbud Night Club har:

```txt
Night Club
Restaurant
Bar
```

Hvert billede skal have en hover- eller touch-animation\*:

- Billedet dækkes af en sort boks.
- Borders flyver ind fra top og bund.
- Tekst tonerfrem fra gennemsigtig til synlig.
- Hele animationen tager 1,5 sekund.

\*Se ressourcer for demo på ItsLearning.

### Sektion 2: Featured Events

Denne sektion viser featured events fra API'et (`"isFeatured": true`). Når en bruger flytter musen hen over et event, animeres det\*.

\* Se ressourcer for demo.

Hvert event skal som minimum vise:

- eventnavn
- kort beskrivelse (excerpt)
- dato
- tidspunkt
- sted
- billede (thumbnail)
- en "Book Now"-knap

Indholdet kommer fra `GET /events`.

"Book Now" skal føre brugeren videre til bordbooking.

API'et leverer ikke en færdig booking-URL. Den skal I selv bygge i frontenden ud fra eventets `id`.

### Sektion 3: Night Club Gallery

Galleriet viser et udvalg af fotos fra events, koncerter og fester. Fotos hentes fra API'et via `GET /gallery`.

Galleriet vises i to dele:

- når den besøgende scroller ned til galleriet, animeres billederne ind\*
- når der klikkes på et billede, vises billedet i en lightbox/modal med mulighed for at bladre frem og tilbage mellem billederne

\* Se ressourcer for demo.

### Sektion 4: Night Club Track

Denne sektion viser en musikafspiller, som lader besøgende lytte til optrædende kunstnere.

Afspilleren skal som minimum have:

- stort billede af den valgte kunstner
- play/pause
- volumen
- visning af aktuel tid og samlet tracklængde
- et mindre galleri med øvrige kunstnere/tracks

Under selve afspilleren er et lille galleri med resten af kunstnerne. Afspilleren spiller kunstnerens musik, når der klikkes på en kunstner i dette galleri.

### Sektion 5: Latest Video

Denne sektion er en simpel video/media-afspiller med de to seneste videoer.

### Sektion 6: Testimonials

Denne sektion præsenterer 2-3 testimonials fra klubgæster. Det er et simpelt slideshow med billede, tekst og SoMe-links.

Informationerne hentes fra API'et via:

```txt
GET /testimonials
```

### Sektion 7: Mailing List Subscription

Her kan en besøgende tilmelde sig Night Club's nyhedsbrev.

Formularen skal indeholde et e-mailfelt og en "Subscribe"-knap. Når brugeren klikker "Subscribe", skal brugeren have feedback om, at tilmeldingen er registreret.

Formularen skal valideres, så der kun kan sendes gyldige e-mailadresser. Tilmeldinger sendes til API'et:

```txt
POST /newsletters
```

API'et afviser dubletter med HTTP `409 Conflict`, så frontenden skal kunne vise en forståelig besked, hvis e-mailadressen allerede er tilmeldt.

## Events

Events-siden skal vise alle events fra API'et.

Events skal kunne vises med pagination, hvor der maksimalt vises tre events per side.

Hvert event-card skal som minimum indeholde:

- billede
- eventnavn
- dato
- doors open eller starttidspunkt
- sted
- kort uddrag
- "Read More"-knap

Når der klikkes på et event, føres brugeren til eventets detail-side. I kan bruge eventets `slug` til segment routes, fx:

```txt
/events/neon-nights-grand-opening
```

## Enkelt Event

På denne side præsenteres et enkelt event.

Eventet kan hentes fra API'et med id eller slug:

```txt
GET /events/:id
GET /events/:slug
```

Siden skal som minimum vise:

- hero-billede
- eventnavn
- dato
- doors open
- starttidspunkt
- sted
- kategori
- pris
- aldersgrænse
- lineup
- schedule/program
- længere beskrivelse
- "Book Now"-knap

Eventets kommentarer skal også vises på siden.

Der skal være en formular, hvor brugeren kan skrive en ny kommentar til eventet.

Når formularen sendes, skal der oprettes en kommentar i API'et:

```txt
POST /comments
```

Payload skal indeholde `eventId`, `name`, `content` og `date`.

Eksempel:

```json
{
  "eventId": 1,
  "name": "Robert Downey Junior",
  "content": "What an amazing evening!",
  "date": "2026-05-09T22:15:00+02:00"
}
```

Formularen skal valideres, og brugeren skal have tydelig feedback ved både succes og fejl.

## Book Table

I Night Club er det muligt at reservere et bord til en aften.

Siden skal bestå af to hoveddele:

- en visuel oversigt over borde
- en formular til at gennemføre bookingen

Bordene har numre. Når der klikkes på et bord, sættes bordets nummer ind i formularens felt for table number.

Da sitet er event-baseret, skal booking-flowet kunne tage udgangspunkt i et valgt event. Hvis brugeren kommer fra en "Book Now"-knap på et event, bør eventet være forvalgt i formularen.

Frontenden skal hente eventet og bruge eventets dato som udgangspunkt for reservationen. Reservationen skal sendes til:

```txt
POST /reservations
```

En event-booking skal indeholde:

- navn
- e-mail
- bordnummer
- antal gæster
- dato
- telefonnummer
- `eventId`

Eksempel:

```json
{
  "name": "Robert Downey Jr",
  "email": "downey@mail.dk",
  "table": "5",
  "guests": "4",
  "date": "2026-05-09T20:00:00+02:00",
  "phone": "2342 78986",
  "eventId": 1
}
```

Når der klikkes "Reserve", skal brugeren have at vide, om bordet er optaget, eller om reservationen lykkedes. Endnu bedre er det, hvis brugeren kan se, hvilke borde der er optaget, inden de forsøger at reservere.

Alle borde på Night Club bookes for hele aftenen. Det er derfor ikke muligt at reservere samme bord på samme kalenderdato, hvis bordet allerede er optaget.

Formularen skal valideres, og hvis en besøgende har udfyldt felter forkert, skal der gives brugervenlig feedback.

OBS: Night Club er opmærksom på, at "Book Table"-funktionen kan give UX-udfordringer på mobile enheder. Kunden er derfor åben over for udviklernes løsningsforslag til denne sektion.

## Contact Us

Kontakt-siden indeholder en simpel kontaktformular.

Besøgende kan sende beskeder til ejerne via formularen. Formularen skal valideres, og der skal gives feedback, hvis felter er udfyldt forkert eller mangler.

Beskeder sendes til API'et:

```txt
POST /contact_messages
```

Formularen skal som minimum indeholde:

- navn
- e-mail
- besked

## Aflevering

Afleveringen skal bestå af fire links:

- GitHub-repository
- deployet frontend (evt. Vercel)
- deployet backend (Render)
- screencast, hvor du demonstrerer en feature, du har udviklet i projektet.

Ingen af delene må ændres efter afleveringsfristen.

Alle ændringer, fejlrettelser eller videre arbejde mellem aflevering og eksamen skal derfor foretages i en fork af det afleverede repository. På den måde forbliver afleveringen uændret, mens gruppen kan arbejde videre frem mod eksamen.

Hvis gruppen ændrer seed-data i API’et, eller hvis bestemte testdata skal kunne genskabes til eksamen, skal den relevante db.json være committet i backend-repoet eller afleveres som kopi. Data oprettet via den deployede Render-server skal ikke betragtes som permanent datalagring.

API'et skal deployes til en Render-server, så sitet kan køre mod en tilgængelig backend. Se [REMOTESERVER.md](REMOTESERVER.md).

Derudover skal alle selvstændigt lave en screencast på ca. 3 minutter, hvor du demonstrerer en feature, du har udviklet i projektet. I screencasten skal du vise, hvordan featuren fungerer, og med dine egne ord forklare, hvordan du har kodet den.

Dato og tidspunkt for aflevering: Se Wiseflow.
