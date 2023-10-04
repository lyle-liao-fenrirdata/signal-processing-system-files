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
    const dir = request.nextUrl.searchParams.get('dir')
    if (!dir) {
        return NextResponse.json({ ok: false, message: "dir is required" })
    }
    const path = decodeURIComponent(dir).replace('home/', env.MOUNT_DIR);
    const filename = params.filename;
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