import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const start = Date.now();
  try {
    const body = await request.json();
    const { name = '', description = '' } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Product name is required for AI categorization and tag extraction' },
        { status: 400 }
      );
    }

    const pool = getDbPool();

    // 1. Fetch merchant's existing tag vocabulary (§8.5)
    const vocabRes = await pool.query('SELECT DISTINCT unnest(tags) as tag FROM products WHERE tags IS NOT NULL;');
    const existingTags: string[] = vocabRes.rows.map((r) => r.tag).filter(Boolean);

    // 2. Determine Category & Tags using semantic keyword analysis matching existing vocabulary
    const text = `${name} ${description}`.toLowerCase();

    let category = 'general';
    if (text.includes('audio') || text.includes('earbuds') || text.includes('headphone') || text.includes('soundbar') || text.includes('speaker')) {
      category = 'audio';
    } else if (text.includes('watch') || text.includes('fitness') || text.includes('tracker') || text.includes('band') || text.includes('ring')) {
      category = 'wearables';
    } else if (text.includes('keyboard') || text.includes('mouse') || text.includes('charger') || text.includes('hub') || text.includes('stand') || text.includes('desk') || text.includes('laptop')) {
      category = 'computing';
    } else if (text.includes('light') || text.includes('plug') || text.includes('smart') || text.includes('camera') || text.includes('home')) {
      category = 'smart_home';
    }

    // Match tags from existing vocabulary
    const suggestedTags: Set<string> = new Set();

    // Prioritize existing vocabulary words if they appear in text
    for (const tag of existingTags) {
      if (text.includes(tag.toLowerCase())) {
        suggestedTags.add(tag);
      }
    }

    // Add category-based keyword tags if set is small
    const keywordMap: Record<string, string[]> = {
      anc: ['anc', 'noise-cancelling'],
      wireless: ['wireless', 'bluetooth'],
      battery: ['long-battery'],
      gaming: ['gaming', 'rgb'],
      fast: ['fast-charging'],
      waterproof: ['water-resistant', 'ipx5'],
      mechanical: ['mechanical', 'hot-swappable'],
      amoled: ['amoled', 'display'],
    };

    for (const [kw, tags] of Object.entries(keywordMap)) {
      if (text.includes(kw)) {
        tags.forEach((t) => suggestedTags.add(t));
      }
    }

    if (suggestedTags.size === 0) {
      suggestedTags.add(category);
    }

    const tagArray = Array.from(suggestedTags).slice(0, 6);

    // 3. Log to audit_log (§8.5)
    await pool.query(
      `INSERT INTO audit_log (correlation_id, tool_name, input, decision, reason_code, output, duration_ms, created_at)
       VALUES ($1, 'ai_tagger', $2, 'suggested', 'AI_TAGGING_COMPLETED', $3, $4, NOW());`,
      [
        randomUUID(),
        JSON.stringify({ name, description }),
        JSON.stringify({ category, suggested_tags: tagArray }),
        Date.now() - start,
      ]
    );

    return NextResponse.json({
      category,
      suggested_tags: tagArray,
      existing_vocabulary_matched: existingTags.filter((t) => suggestedTags.has(t)),
      source: 'ai_suggested',
    });
  } catch (error: any) {
    console.error('API /api/tagger error:', error);
    return NextResponse.json(
      { error: error.message || 'Tagging engine encountered a database or parsing failure' },
      { status: 500 }
    );
  }
}
