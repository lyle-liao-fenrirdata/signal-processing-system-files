import * as fs from 'node:fs/promises';
import { env } from "@/env.mjs";
import { NextResponse, NextRequest } from 'next/server';

type GetParams = {
    params: {
        filename: string;
    };
};

// export an async GET function. This is a convention in NextJS
export async function GET(request: NextRequest, { params }: GetParams) {
    const d = request.nextUrl.searchParams.get('d')
    const n = request.nextUrl.searchParams.get('n')
    if (!d || !n) {
        return NextResponse.json({ ok: false, message: "dir and filename are required" })
    }
    const path = decodeURIComponent(d).replace('home/', env.MOUNT_DIR);
    const filename = decodeURIComponent(n);
    const filePath = path + filename;

    try {
        await fs.access(filePath, fs.constants.R_OK)
    } catch (e) {
        return NextResponse.json({ ok: false, message: "file not found: " + filePath })
    }

    const stat = await fs.stat(filePath);
    const readStream = await fs.readFile(filePath);

    return new Response(readStream, {
        headers: {
            'Content-Length': stat.size.toString(),
            "content-disposition": `attachment; filename="${filename}"`,
        }
    });

}