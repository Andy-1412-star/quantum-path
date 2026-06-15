import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'papers.json');
    const fileContent = readFileSync(filePath, 'utf8');
    const papers = JSON.parse(fileContent);
    return NextResponse.json(papers);
  } catch (error) {
    console.error('Error reading papers:', error);
    return NextResponse.json([], { status: 500 });
  }
}
