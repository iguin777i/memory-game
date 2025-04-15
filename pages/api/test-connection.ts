import { supabase } from '@/lib/supabaseClient'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data, error } = await supabase.from('User').select('*').limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    res.status(200).json({ status: 'Connected successfully', data })
  } catch (error) {
    console.error('Connection error:', error)
    res.status(500).json({ error: String(error) })
  }
}