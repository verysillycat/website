import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), 'public', 'songs');
    const files = await fs.readdir(musicDir);
    
    const songs = await Promise.all(
      files.filter(file => file.endsWith('.mp3')).map(async (file) => {
        const [numberStr, rest] = file.split('|');
        const trackNumber = parseInt(numberStr.trim());
        
        const [artist, ...titleParts] = rest.replace('.mp3', '').split('-');
        const title = titleParts.join('-').trim();
        
        const encodedTitle = encodeURIComponent(title);
        const encodedFile = encodeURIComponent(file);
        
        return {
          number: trackNumber,
          title,
          artist: artist.trim(),
          cover: `/songs/covers/${encodedTitle}.png`,
          file: `/songs/${encodedFile}`
        };
      })
    );
    
    songs.sort((a, b) => a.number - b.number);
    
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error loading songs:', error);
    return NextResponse.json({ error: 'Failed to load songs' }, { status: 500 });
  }
} 