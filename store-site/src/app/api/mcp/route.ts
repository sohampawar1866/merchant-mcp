import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.MCP_BACKEND_URL || 'http://localhost:8080/mcp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = req.headers.get('mcp-session-id') || '';
    const merchantKey = req.headers.get('x-merchant-key') || 'mc_live_573406c24c50bd37afbb1a5013048d49';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Merchant-Key': merchantKey,
    };
    if (sessionId) {
      headers['Mcp-Session-Id'] = sessionId;
    }

    const backendRes = await fetch(BACKEND_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    const resHeaders = new Headers();
    resHeaders.set('Content-Type', 'application/json');
    resHeaders.set('Access-Control-Allow-Origin', '*');

    const newSessionId = backendRes.headers.get('mcp-session-id');
    if (newSessionId) {
      resHeaders.set('Mcp-Session-Id', newSessionId);
    }

    return NextResponse.json(data, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32603, message: error.message || 'Internal MCP gateway proxy error' }, id: null },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id, X-Merchant-Key',
    },
  });
}
