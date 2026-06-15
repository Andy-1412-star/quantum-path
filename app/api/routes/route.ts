import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'routes.json');
    const fileContent = readFileSync(filePath, 'utf8');
    const routes = JSON.parse(fileContent);
    return NextResponse.json(routes);
  } catch (error) {
    console.error('Error reading routes:', error);
    return NextResponse.json([], { status: 500 });
  }
}
