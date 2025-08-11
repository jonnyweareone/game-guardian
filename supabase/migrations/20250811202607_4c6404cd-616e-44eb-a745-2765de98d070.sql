-- Explicitly deny direct client access to activation_codes (functions use service role)
CREATE POLICY "No direct access to activation_codes"
ON public.activation_codes
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);