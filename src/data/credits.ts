/**
 * Attribution for the portrait photographs.
 *
 * Every image in /public/portraits is either public domain or Creative Commons
 * from Wikimedia Commons. The CC BY-SA files carry an attribution requirement,
 * so the credit is shown on the profile page rather than buried in a file —
 * that is the condition of the licence, not a nicety.
 */

export interface PhotoCredit {
  /** photographer or author, as recorded on Commons */
  artist: string;
  licence: string;
  /** original file name on Wikimedia Commons */
  file: string;
}

export const PHOTO_CREDITS: Record<string, PhotoCredit> = {
  'michael-jackson': {
    artist: 'Anurekhac7',
    licence: 'CC BY-SA 4.0',
    file: '32 Michael Jackson 1991 by Arun.jpg',
  },
  'cristiano-ronaldo': {
    artist: 'Анна Нэсси',
    licence: 'CC BY-SA 3.0',
    file: 'Cristiano Ronaldo 2018.jpg',
  },
  'albert-einstein': {
    artist: 'Ferdinand Schmutzer, restored by Adam Cuerden',
    licence: 'Public domain',
    file: 'Einstein 1921 by F Schmutzer - restoration.jpg',
  },
  'leonardo-da-vinci': {
    artist: 'Leonardo da Vinci — presumed self-portrait, c. 1512',
    licence: 'Public domain',
    file: 'Leonardo self.jpg',
  },
  'steve-jobs': {
    artist: 'Matthew Yohe',
    licence: 'CC BY-SA 3.0',
    file: 'Steve Jobs Headshot 2010-CROP.jpg',
  },
  'marilyn-monroe': {
    artist: 'Screen capture from the Gentlemen Prefer Blondes trailer (1953)',
    licence: 'Public domain',
    file: 'Marilyn Monroe in Gentlemen Prefer Blondes trailer.jpg',
  },
  'muhammad-ali': {
    artist: 'Ira Rosenberg, New York World-Telegram & Sun',
    licence: 'Public domain',
    file: 'Muhammad Ali NYWTS.jpg',
  },
  'lionel-messi': {
    artist: 'Кирилл Венедиктов',
    licence: 'CC BY-SA 3.0',
    file: 'Lionel Messi 20180626.jpg',
  },
  'nikola-tesla': {
    artist: 'Unknown photographer, c. 1890',
    licence: 'Public domain',
    file: 'N.Tesla.JPG',
  },
  'charlie-chaplin': {
    artist: 'P. D. Jankens',
    licence: 'Public domain',
    file: 'Charlie Chaplin.jpg',
  },
};

/** Source of every portrait, shown wherever the credits are surfaced. */
export const PHOTO_SOURCE = 'Wikimedia Commons';
