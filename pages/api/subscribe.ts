import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    email: string;
  };
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = await prisma.subscription.findUnique({
        where: {
          email: req.body.email,
        },
      });

      if (data) {
        return res.status(200).json({});
      }

      await prisma.subscription.create({
        data: {
          email: req.body.email,
        },
      });

      return res.status(200).json({});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Something went wrong' });
    }
  }

  return res.status(405).json({ msg: 'Method not allowed' });
}
