// Invite Collaborator Edge Function
// Handles inviting users to collaborate on a journey
// - If user exists: returns their user_id
// - If user doesn't exist: sends Supabase invite email and returns email for pending storage

/* eslint-disable no-console */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  email: string;
  journeyName: string;
  inviterName?: string;
}

interface InviteResponse {
  userId: string | null;
  email: string;
  isNewUser: boolean;
  error: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('[invite-collaborator] Starting...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[invite-collaborator] Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' } as InviteResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.json() as InviteRequest;
    const { email, journeyName, inviterName } = body;
    
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log('[invite-collaborator] Processing invite for:', normalizedEmail.substring(0, 3) + '***');

    // First, check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .rpc('get_user_id_by_email', { email_input: normalizedEmail });

    if (existingUser) {
      console.log('[invite-collaborator] User exists, returning user_id');
      return new Response(
        JSON.stringify({
          userId: existingUser,
          email: normalizedEmail,
          isNewUser: false,
          error: null,
        } as InviteResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User doesn't exist - send notification email via Resend
    console.log('[invite-collaborator] User not found, sending notification email...');
    
    let emailSent = false;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Sunroof <noreply@getsunroof.com>',
            to: normalizedEmail,
            subject: `${inviterName || 'Someone'} invited you to a journey on Sunroof`,
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 460px; margin: 0 auto; background: linear-gradient(180deg, #451a03 0%, #0f172a 100%); padding: 40px 20px; border-radius: 20px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 48px;">☀️</span>
                  <h1 style="color: #fff; margin: 8px 0;">Sunroof</h1>
                </div>
                <div style="background: rgba(0,0,0,0.4); border-radius: 16px; padding: 24px; text-align: center;">
                  <p style="color: #fff; font-size: 18px; margin: 0 0 16px;">You're invited! 🎉</p>
                  <p style="color: rgba(255,255,255,0.7); margin: 0 0 20px;">
                    <strong>${inviterName || 'A friend'}</strong> invited you to collaborate on <strong>${journeyName}</strong>
                  </p>
                  <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
                    Download Sunroof and sign up with this email to join the journey and start capturing memories together.
                  </p>
                </div>
                <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center; margin-top: 24px;">
                  Sunroof — Capture now, relive later.
                </p>
              </div>
            `,
          }),
        });
        
        if (emailResponse.ok) {
          emailSent = true;
          console.log('[invite-collaborator] Notification email sent via Resend');
        } else {
          const errorText = await emailResponse.text();
          console.warn('[invite-collaborator] Resend error:', errorText);
        }
      } catch (emailError) {
        console.warn('[invite-collaborator] Email send error:', emailError);
      }
    } else {
      console.log('[invite-collaborator] RESEND_API_KEY not set, skipping email');
    }

    console.log('[invite-collaborator] Returning pending invite, email sent:', emailSent);
    
    return new Response(
      JSON.stringify({
        userId: null,
        email: normalizedEmail,
        isNewUser: true,
        error: null,
      } as InviteResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[invite-collaborator] Unhandled error:', error);
    return new Response(
      JSON.stringify({ 
        userId: null, 
        email: '', 
        isNewUser: false, 
        error: 'Internal server error' 
      } as InviteResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
