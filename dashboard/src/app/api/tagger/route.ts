import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const start = Date.now();
  try {
    const body = await request.json();
    const { name = '', description = '', merchant_id } = body;

    if (!merchant_id) {
      return NextResponse.json(
        {
          error: 'MISSING_MERCHANT_ID',
          message: 'merchant_id is required for AI tagging.',
          hint: 'Include merchant_id in the request body.',
        },
        { status: 400 }
      );
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'Product name is required for AI categorization and tag extraction' },
        { status: 400 }
      );
    }

    const pool = getDbPool();

    // Fetch this merchant's existing tag vocabulary only
    const vocabRes = await pool.query(
      'SELECT DISTINCT unnest(tags) as tag FROM products WHERE merchant_id = $1 AND tags IS NOT NULL;',
      [merchant_id]
    );
    const existingTags: string[] = vocabRes.rows.map((r) => r.tag).filter(Boolean);

    // Determine Category & Tags using semantic keyword analysis across all major sectors
    const text = `${name} ${description}`.toLowerCase();

    let category = 'general';
    if (text.includes('audio') || text.includes('earbuds') || text.includes('headphone') || text.includes('soundbar') || text.includes('speaker') || text.includes('earphones') || text.includes('tws')) {
      category = 'audio';
    } else if (text.includes('smartwatch') || text.includes('watch') || text.includes('fitness tracker') || text.includes('smart band') || text.includes('pulse')) {
      category = 'wearables';
    } else if (text.includes('laptop') || text.includes('keyboard') || text.includes('mouse') || text.includes('monitor') || text.includes('stand') || text.includes('desk') || text.includes('computing')) {
      category = 'computing';
    } else if (text.includes('smart bulb') || text.includes('smart plug') || text.includes('projector') || text.includes('smart home') || text.includes('iot')) {
      category = 'smart_home';
    } else if (text.includes('charger') || text.includes('cable') || text.includes('power bank') || text.includes('gan') || text.includes('adapter') || text.includes('power strip')) {
      category = 'mobile_accessories';
    } else if (text.includes('camera') || text.includes('drone') || text.includes('tripod') || text.includes('lens')) {
      category = 'cameras_optics';
    } else if (text.includes('coffee') || text.includes('tea') || text.includes('chai') || text.includes('cold brew') || text.includes('drink') || text.includes('juice') || text.includes('beverage') || text.includes('latte')) {
      category = 'beverages';
    } else if (text.includes('snack') || text.includes('namkeen') || text.includes('chikki') || text.includes('biscuit') || text.includes('cookie') || text.includes('chocolate') || text.includes('crackers') || text.includes('bar') || text.includes('peanut butter') || text.includes('gulab jamun') || text.includes('kaju katli') || text.includes('food')) {
      category = 'packaged_food';
    } else if (text.includes('yogurt') || text.includes('milk') || text.includes('curd') || text.includes('paneer') || text.includes('cheese') || text.includes('dairy') || text.includes('oat milk')) {
      category = 'dairy_fresh';
    } else if (text.includes('chicken') || text.includes('meat') || text.includes('mutton') || text.includes('prawn') || text.includes('fish') || text.includes('egg') || text.includes('tikka') || text.includes('seafood') || text.includes('curry cut')) {
      category = 'meat_seafood';
    } else if (text.includes('grain') || text.includes('rice') || text.includes('oil') || text.includes('spice') || text.includes('staple') || text.includes('organic')) {
      category = 'organic_staples';
    } else if (text.includes('serum') || text.includes('sunscreen') || text.includes('face wash') || text.includes('lipstick') || text.includes('makeup') || text.includes('skincare') || text.includes('cosmetics') || text.includes('hair oil') || text.includes('moisturizer')) {
      category = 'beauty_skincare';
    } else if (text.includes('shaving') || text.includes('razor') || text.includes('beard') || text.includes('soap') || text.includes('shampoo') || text.includes('grooming') || text.includes('body wash')) {
      category = 'personal_care';
    } else if (text.includes('whey') || text.includes('protein') || text.includes('isolate') || text.includes('supplement') || text.includes('nutrition') || text.includes('creatine') || text.includes('multivitamin') || text.includes('fish oil')) {
      category = 'health_nutrition';
    } else if (text.includes('bp monitor') || text.includes('thermometer') || text.includes('blood pressure') || text.includes('wellness') || text.includes('first aid') || text.includes('tablet')) {
      category = 'pharmacy_wellness';
    } else if (text.includes('kurta') || text.includes('shirt') || text.includes('t-shirt') || text.includes('jeans') || text.includes('trousers') || text.includes('boxers')) {
      category = 'mens_apparel';
    } else if (text.includes('saree') || text.includes('dupatta') || text.includes('dress') || text.includes('skirt') || text.includes('women')) {
      category = 'womens_apparel';
    } else if (text.includes('luggage') || text.includes('suitcase') || text.includes('trolley') || text.includes('backpack') || text.includes('duffle') || text.includes('duffel') || text.includes('travel bag')) {
      category = 'luggage_bags';
    } else if (text.includes('purifier') || text.includes('cookware') || text.includes('cleaner') || text.includes('kitchen') || text.includes('glassware') || text.includes('water purifier') || text.includes('towel')) {
      category = 'home_kitchen';
    } else if (text.includes('runner') || text.includes('dhoop') || text.includes('decor') || text.includes('candle') || text.includes('lighting') || text.includes('cushion')) {
      category = 'home_decor';
    } else if (text.includes('yoga') || text.includes('dumbbell') || text.includes('skipping rope') || text.includes('fitness') || text.includes('gym')) {
      category = 'fitness_sports';
    } else if (text.includes('book') || text.includes('notebook') || text.includes('stationery') || text.includes('pen') || text.includes('journal')) {
      category = 'books_stationery';
    }

    const suggestedTags: Set<string> = new Set();
    for (const tag of existingTags) {
      if (text.includes(tag.toLowerCase())) {
        suggestedTags.add(tag);
      }
    }

    const keywordMap: Record<string, string[]> = {
      anc: ['anc', 'noise-cancelling'],
      wireless: ['wireless', 'bluetooth'],
      battery: ['long-battery'],
      gaming: ['gaming', 'rgb'],
      fast: ['fast-charging', 'type-c'],
      waterproof: ['water-resistant', 'ipx5'],
      mechanical: ['mechanical', 'hot-swappable'],
      amoled: ['amoled', 'display'],
      protein: ['protein', 'clean-nutrition', 'fitness'],
      coffee: ['specialty-coffee', 'artisanal', 'caffeine'],
      roast: ['dark-roast', 'single-origin'],
      organic: ['organic', 'chemical-free', 'natural'],
      skincare: ['skincare', 'dermatology-tested', 'glow'],
      shaving: ['grooming', 'precision-shave'],
      travel: ['travel-ready', 'ergonomic', 'durable'],
      snack: ['snack', 'indian-flavours', 'ready-to-eat'],
      curd: ['probiotic', 'high-protein'],
      purifier: ['ro-uv', 'pure-water', 'smart-home'],
      yoga: ['yoga', 'anti-skid', 'wellness'],
    };

    for (const [kw, tags] of Object.entries(keywordMap)) {
      if (text.includes(kw)) {
        tags.forEach((t) => suggestedTags.add(t));
      }
    }

    if (suggestedTags.size === 0) suggestedTags.add(category);

    const tagArray = Array.from(suggestedTags).slice(0, 6);

    await pool.query(
      `INSERT INTO audit_log (merchant_id, correlation_id, tool_name, input, decision, reason_code, output, duration_ms, created_at)
       VALUES ($1, $2, 'ai_tagger', $3, 'suggested', 'AI_TAGGING_COMPLETED', $4, $5, NOW());`,
      [
        merchant_id,
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
      { error: error.message || 'Tagging engine failure' },
      { status: 500 }
    );
  }
}
