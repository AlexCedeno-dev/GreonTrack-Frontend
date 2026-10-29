-- Esquema de GreonTrack (tablas, funciones, triggers, políticas RLS y permisos),
-- extraído del respaldo del 03/10/2026. SIN datos. Sirve para recrear el
-- proyecto de Supabase desde cero: ejecútalo en el SQL Editor de un proyecto
-- nuevo y luego aplica supabase/keepalive.sql.

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;

--
-- Name: calcular_consumo(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_consumo() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_usuario_id uuid;
  v_watts numeric;
  v_tarifa numeric;
  v_factor numeric;
  v_kwh numeric;
begin
  select usuario_id, consumo_watts_promedio
    into v_usuario_id, v_watts
    from dispositivos
    where id = new.dispositivo_id;

  select tarifa_kwh, factor_co2 into v_tarifa, v_factor
    from configuracion where id = 1;

  v_kwh := (v_watts * new.horas_uso) / 1000.0;

  insert into calculos (usuario_id, dispositivo_id, registro_uso_id, kwh, costo, co2, fecha)
  values (
    v_usuario_id,
    new.dispositivo_id,
    new.id,
    v_kwh,
    v_kwh * v_tarifa,
    v_kwh * v_factor,
    new.created_at
  );

  return new;
end;
$$;


ALTER FUNCTION public.calcular_consumo() OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)));
  return new;
end;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: calculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calculos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    dispositivo_id uuid NOT NULL,
    registro_uso_id uuid,
    kwh numeric NOT NULL,
    costo numeric NOT NULL,
    co2 numeric NOT NULL,
    fecha timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.calculos OWNER TO postgres;

--
-- Name: configuracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion (
    id integer DEFAULT 1 NOT NULL,
    tarifa_kwh numeric DEFAULT 3.5 NOT NULL,
    factor_co2 numeric DEFAULT 0.494 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT configuracion_id_check CHECK ((id = 1))
);


ALTER TABLE public.configuracion OWNER TO postgres;

--
-- Name: dispositivos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispositivos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    nombre text NOT NULL,
    tipo text NOT NULL,
    consumo_watts_promedio numeric NOT NULL,
    origen text DEFAULT 'manual'::text NOT NULL,
    device_token text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    info_registro jsonb,
    CONSTRAINT dispositivos_origen_check CHECK ((origen = ANY (ARRAY['manual'::text, 'agente'::text])))
);


ALTER TABLE public.dispositivos OWNER TO postgres;

--
-- Name: dispositivos_sugeridos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispositivos_sugeridos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    ip text NOT NULL,
    mac text NOT NULL,
    vendor text,
    tipo_detectado text NOT NULL,
    nombre_sugerido text NOT NULL,
    watts_estimados integer NOT NULL,
    estado text DEFAULT 'pendiente'::text NOT NULL,
    fecha_deteccion timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dispositivos_sugeridos OWNER TO postgres;

--
-- Name: perfiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.perfiles (
    id uuid NOT NULL,
    nombre text NOT NULL,
    role text DEFAULT 'general'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    aviso_privacidad_aceptado_en timestamp with time zone,
    aviso_privacidad_firma text,
    greon_consultas_total integer DEFAULT 0 NOT NULL,
    CONSTRAINT perfiles_role_check CHECK ((role = ANY (ARRAY['general'::text, 'analitico'::text, 'admin'::text])))
);


ALTER TABLE public.perfiles OWNER TO postgres;

--
-- Name: recomendaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recomendaciones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    dispositivo_id uuid,
    mensaje text NOT NULL,
    fecha timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recomendaciones OWNER TO postgres;

--
-- Name: registros_uso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registros_uso (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dispositivo_id uuid NOT NULL,
    horas_uso numeric NOT NULL,
    fuente text DEFAULT 'manual'::text NOT NULL,
    fecha_uso date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT registros_uso_fuente_check CHECK ((fuente = ANY (ARRAY['manual'::text, 'agente'::text]))),
    CONSTRAINT registros_uso_horas_uso_check CHECK (((horas_uso >= (0)::numeric) AND (horas_uso <= (24)::numeric)))
);


ALTER TABLE public.registros_uso OWNER TO postgres;

--
-- Name: sniffer_estado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sniffer_estado (
    usuario_id uuid NOT NULL,
    ultimo_sondeo timestamp with time zone DEFAULT now() NOT NULL,
    dispositivos_detectados integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.sniffer_estado OWNER TO postgres;

--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: calculos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: configuracion; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: dispositivos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: dispositivos_sugeridos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: recomendaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: registros_uso; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sniffer_estado; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: calculos calculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos
    ADD CONSTRAINT calculos_pkey PRIMARY KEY (id);


--
-- Name: configuracion configuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_pkey PRIMARY KEY (id);


--
-- Name: dispositivos dispositivos_device_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos
    ADD CONSTRAINT dispositivos_device_token_key UNIQUE (device_token);


--
-- Name: dispositivos dispositivos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos
    ADD CONSTRAINT dispositivos_pkey PRIMARY KEY (id);


--
-- Name: dispositivos_sugeridos dispositivos_sugeridos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos_sugeridos
    ADD CONSTRAINT dispositivos_sugeridos_pkey PRIMARY KEY (id);


--
-- Name: dispositivos_sugeridos dispositivos_sugeridos_usuario_id_mac_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos_sugeridos
    ADD CONSTRAINT dispositivos_sugeridos_usuario_id_mac_key UNIQUE (usuario_id, mac);


--
-- Name: perfiles perfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_pkey PRIMARY KEY (id);


--
-- Name: recomendaciones recomendaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT recomendaciones_pkey PRIMARY KEY (id);


--
-- Name: registros_uso registros_uso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_uso
    ADD CONSTRAINT registros_uso_pkey PRIMARY KEY (id);


--
-- Name: sniffer_estado sniffer_estado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sniffer_estado
    ADD CONSTRAINT sniffer_estado_pkey PRIMARY KEY (usuario_id);


--
-- Name: idx_calculos_dispositivo_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calculos_dispositivo_id ON public.calculos USING btree (dispositivo_id);


--
-- Name: idx_calculos_usuario_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calculos_usuario_id ON public.calculos USING btree (usuario_id);


--
-- Name: idx_dispositivos_usuario_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispositivos_usuario_id ON public.dispositivos USING btree (usuario_id);


--
-- Name: idx_recomendaciones_usuario_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recomendaciones_usuario_id ON public.recomendaciones USING btree (usuario_id);


--
-- Name: idx_registros_uso_dispositivo_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_uso_dispositivo_id ON public.registros_uso USING btree (dispositivo_id);


--
-- Name: idx_registros_uso_fecha_uso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_uso_fecha_uso ON public.registros_uso USING btree (fecha_uso);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: registros_uso on_registro_uso_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_registro_uso_insert AFTER INSERT ON public.registros_uso FOR EACH ROW EXECUTE FUNCTION public.calcular_consumo();


--
-- Name: calculos calculos_dispositivo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos
    ADD CONSTRAINT calculos_dispositivo_id_fkey FOREIGN KEY (dispositivo_id) REFERENCES public.dispositivos(id) ON DELETE CASCADE;


--
-- Name: calculos calculos_registro_uso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos
    ADD CONSTRAINT calculos_registro_uso_id_fkey FOREIGN KEY (registro_uso_id) REFERENCES public.registros_uso(id) ON DELETE CASCADE;


--
-- Name: calculos calculos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calculos
    ADD CONSTRAINT calculos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: dispositivos_sugeridos dispositivos_sugeridos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos_sugeridos
    ADD CONSTRAINT dispositivos_sugeridos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id);


--
-- Name: dispositivos dispositivos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos
    ADD CONSTRAINT dispositivos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: perfiles perfiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: recomendaciones recomendaciones_dispositivo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT recomendaciones_dispositivo_id_fkey FOREIGN KEY (dispositivo_id) REFERENCES public.dispositivos(id) ON DELETE SET NULL;


--
-- Name: recomendaciones recomendaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recomendaciones
    ADD CONSTRAINT recomendaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: registros_uso registros_uso_dispositivo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_uso
    ADD CONSTRAINT registros_uso_dispositivo_id_fkey FOREIGN KEY (dispositivo_id) REFERENCES public.dispositivos(id) ON DELETE CASCADE;


--
-- Name: sniffer_estado sniffer_estado_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sniffer_estado
    ADD CONSTRAINT sniffer_estado_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id);


--
-- Name: calculos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.calculos ENABLE ROW LEVEL SECURITY;

--
-- Name: configuracion; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

--
-- Name: dispositivos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;

--
-- Name: dispositivos_sugeridos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.dispositivos_sugeridos ENABLE ROW LEVEL SECURITY;

--
-- Name: perfiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

--
-- Name: recomendaciones; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recomendaciones ENABLE ROW LEVEL SECURITY;

--
-- Name: registros_uso; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.registros_uso ENABLE ROW LEVEL SECURITY;

--
-- Name: sniffer_estado; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sniffer_estado ENABLE ROW LEVEL SECURITY;

--
-- Name: sniffer_estado usuarios actualizan su estado; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios actualizan su estado" ON public.sniffer_estado FOR UPDATE USING ((auth.uid() = usuario_id));


--
-- Name: dispositivos_sugeridos usuarios actualizan sus sugerencias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios actualizan sus sugerencias" ON public.dispositivos_sugeridos FOR UPDATE USING ((auth.uid() = usuario_id));


--
-- Name: configuracion usuarios autenticados leen configuracion; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios autenticados leen configuracion" ON public.configuracion FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: sniffer_estado usuarios borran su estado; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios borran su estado" ON public.sniffer_estado FOR DELETE USING ((auth.uid() = usuario_id));


--
-- Name: dispositivos_sugeridos usuarios borran sus sugerencias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios borran sus sugerencias" ON public.dispositivos_sugeridos FOR DELETE USING ((auth.uid() = usuario_id));


--
-- Name: dispositivos_sugeridos usuarios insertan sus sugerencias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios insertan sus sugerencias" ON public.dispositivos_sugeridos FOR INSERT WITH CHECK ((auth.uid() = usuario_id));


--
-- Name: sniffer_estado usuarios upsertan su estado; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios upsertan su estado" ON public.sniffer_estado FOR INSERT WITH CHECK ((auth.uid() = usuario_id));


--
-- Name: sniffer_estado usuarios ven su estado; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios ven su estado" ON public.sniffer_estado FOR SELECT USING ((auth.uid() = usuario_id));


--
-- Name: perfiles usuarios ven su perfil; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios ven su perfil" ON public.perfiles USING ((auth.uid() = id));


--
-- Name: calculos usuarios ven sus calculos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios ven sus calculos" ON public.calculos USING ((auth.uid() = usuario_id));


--
-- Name: dispositivos usuarios ven sus dispositivos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios ven sus dispositivos" ON public.dispositivos USING ((auth.uid() = usuario_id));


--
-- Name: recomendaciones usuarios ven sus recomendaciones; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios ven sus recomendaciones" ON public.recomendaciones USING ((auth.uid() = usuario_id));


--
-- Name: registros_uso usuarios ven sus registros; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios ven sus registros" ON public.registros_uso USING ((dispositivo_id IN ( SELECT dispositivos.id
   FROM public.dispositivos
  WHERE (dispositivos.usuario_id = auth.uid()))));


--
-- Name: dispositivos_sugeridos usuarios ven sus sugerencias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "usuarios ven sus sugerencias" ON public.dispositivos_sugeridos FOR SELECT USING ((auth.uid() = usuario_id));


--
-- Name: FUNCTION calcular_consumo(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calcular_consumo() TO anon;
GRANT ALL ON FUNCTION public.calcular_consumo() TO authenticated;
GRANT ALL ON FUNCTION public.calcular_consumo() TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: TABLE calculos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.calculos TO anon;
GRANT ALL ON TABLE public.calculos TO authenticated;
GRANT ALL ON TABLE public.calculos TO service_role;


--
-- Name: TABLE configuracion; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.configuracion TO anon;
GRANT ALL ON TABLE public.configuracion TO authenticated;
GRANT ALL ON TABLE public.configuracion TO service_role;


--
-- Name: TABLE dispositivos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.dispositivos TO anon;
GRANT ALL ON TABLE public.dispositivos TO authenticated;
GRANT ALL ON TABLE public.dispositivos TO service_role;


--
-- Name: TABLE dispositivos_sugeridos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.dispositivos_sugeridos TO anon;
GRANT ALL ON TABLE public.dispositivos_sugeridos TO authenticated;
GRANT ALL ON TABLE public.dispositivos_sugeridos TO service_role;


--
-- Name: TABLE perfiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.perfiles TO anon;
GRANT ALL ON TABLE public.perfiles TO authenticated;
GRANT ALL ON TABLE public.perfiles TO service_role;


--
-- Name: TABLE recomendaciones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.recomendaciones TO anon;
GRANT ALL ON TABLE public.recomendaciones TO authenticated;
GRANT ALL ON TABLE public.recomendaciones TO service_role;


--
-- Name: TABLE registros_uso; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.registros_uso TO anon;
GRANT ALL ON TABLE public.registros_uso TO authenticated;
GRANT ALL ON TABLE public.registros_uso TO service_role;


--
-- Name: TABLE sniffer_estado; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sniffer_estado TO anon;
GRANT ALL ON TABLE public.sniffer_estado TO authenticated;
GRANT ALL ON TABLE public.sniffer_estado TO service_role;
