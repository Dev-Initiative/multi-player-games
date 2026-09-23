CREATE TABLE players (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    username       text        NOT NULL,
    password_hash  text        NOT NULL,
    is_bot         boolean     NOT NULL DEFAULT false,
    created_at     timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT players_username_format CHECK (username ~ '^[A-Za-z0-9_]{3,20}$')
);

CREATE UNIQUE INDEX players_username_lower_key ON players (lower(username));

CREATE TABLE games (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type     text        NOT NULL,
    config        jsonb       NOT NULL,
    status        text        NOT NULL,
    version       integer     NOT NULL DEFAULT 0,
    move_count    integer     NOT NULL DEFAULT 0,
    seat_count    smallint,
    current_seat  smallint,
    state         jsonb,
    winner_seat   smallint,
    created_by    uuid        NOT NULL REFERENCES players (id),
    created_at    timestamptz NOT NULL DEFAULT now(),
    started_at    timestamptz,
    ended_at      timestamptz,

    CONSTRAINT games_status_valid CHECK (status IN ('WAITING', 'SETUP', 'ACTIVE', 'FINISHED', 'CANCELLED', 'ABANDONED')),
    CONSTRAINT games_version_non_negative CHECK (version >= 0),
    CONSTRAINT games_move_count_non_negative CHECK (move_count >= 0),
    CONSTRAINT games_seat_count_at_least_two CHECK (seat_count IS NULL OR seat_count >= 2),
    CONSTRAINT games_current_seat_in_range CHECK (current_seat IS NULL OR (seat_count IS NOT NULL AND current_seat >= 0 AND current_seat < seat_count)),
    CONSTRAINT games_winner_seat_in_range CHECK (winner_seat IS NULL OR (seat_count IS NOT NULL AND winner_seat >= 0 AND winner_seat < seat_count)),
    CONSTRAINT games_lobby_is_empty CHECK (status <> 'WAITING' OR (state IS NULL AND seat_count IS NULL AND current_seat IS NULL AND move_count = 0 AND winner_seat IS NULL)),
    CONSTRAINT games_started_is_complete CHECK (status NOT IN ('SETUP', 'ACTIVE', 'FINISHED', 'ABANDONED') OR (state IS NOT NULL AND seat_count IS NOT NULL AND started_at IS NOT NULL)),
    CONSTRAINT games_active_has_a_turn CHECK (status <> 'ACTIVE' OR current_seat IS NOT NULL),
    CONSTRAINT games_ended_has_no_turn CHECK (status NOT IN ('FINISHED', 'CANCELLED', 'ABANDONED') OR current_seat IS NULL),
    CONSTRAINT games_ended_has_timestamp CHECK ((status IN ('FINISHED', 'CANCELLED', 'ABANDONED')) = (ended_at IS NOT NULL)),
    CONSTRAINT games_winner_only_when_finished CHECK (winner_seat IS NULL OR status = 'FINISHED')
);

CREATE INDEX games_open_idx ON games (status) WHERE status IN ('WAITING', 'SETUP', 'ACTIVE');

CREATE TABLE seats (
    game_id       uuid        NOT NULL REFERENCES games (id) ON DELETE CASCADE,
    seat_index    smallint    NOT NULL,
    player_id     uuid        NOT NULL REFERENCES players (id),
    status        text        NOT NULL DEFAULT 'PENDING',
    invited_at    timestamptz NOT NULL DEFAULT now(),
    responded_at  timestamptz,

    CONSTRAINT seats_pkey PRIMARY KEY (game_id, seat_index),
    CONSTRAINT seats_one_per_player UNIQUE (game_id, player_id),
    CONSTRAINT seats_status_valid CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
    CONSTRAINT seats_index_non_negative CHECK (seat_index >= 0),
    CONSTRAINT seats_responded_when_answered CHECK ((status = 'PENDING') = (responded_at IS NULL))
);

CREATE INDEX seats_by_player_idx ON seats (player_id);
CREATE INDEX seats_pending_by_player_idx ON seats (player_id) WHERE status = 'PENDING';

CREATE TABLE log_entries (
    game_id          uuid        NOT NULL,
    seq              integer     NOT NULL,
    kind             text        NOT NULL,
    seat             smallint    NOT NULL,
    payload          jsonb       NOT NULL,
    effect           jsonb       NOT NULL,
    idempotency_key  text,
    created_at       timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT log_entries_pkey PRIMARY KEY (game_id, seq),
    CONSTRAINT log_entries_idempotent UNIQUE (game_id, idempotency_key),
    CONSTRAINT log_entries_kind_valid CHECK (kind IN ('MOVE', 'RESIGN', 'ABANDON')),
    CONSTRAINT log_entries_seq_positive CHECK (seq > 0),
    CONSTRAINT log_entries_seat_fkey FOREIGN KEY (game_id, seat) REFERENCES seats (game_id, seat_index) ON UPDATE RESTRICT ON DELETE RESTRICT
);

CREATE FUNCTION games_reject_immutable_changes() RETURNS trigger AS $$
BEGIN
    IF NEW.game_type IS DISTINCT FROM OLD.game_type THEN
        RAISE EXCEPTION 'games.game_type is immutable (game %)', OLD.id;
    END IF;
    IF NEW.config IS DISTINCT FROM OLD.config THEN
        RAISE EXCEPTION 'games.config is immutable: replay starts from initialState(config), so editing it breaks C3 (game %)', OLD.id;
    END IF;
    IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
        RAISE EXCEPTION 'games.created_by is immutable (game %)', OLD.id;
    END IF;
    IF OLD.seat_count IS NOT NULL AND NEW.seat_count IS DISTINCT FROM OLD.seat_count THEN
        RAISE EXCEPTION 'games.seat_count is fixed at start and cannot change (game %)', OLD.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_immutable_columns BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION games_reject_immutable_changes();

CREATE FUNCTION log_entries_append_only() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'log_entries is append-only: % rejected on game % seq %', TG_OP, OLD.game_id, OLD.seq;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_entries_no_rewrite BEFORE UPDATE OR DELETE ON log_entries FOR EACH ROW EXECUTE FUNCTION log_entries_append_only();
