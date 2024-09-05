DROP TYPE IF EXISTS tip_produs;
DROP TYPE IF EXISTS livrare;
DROP TYPE IF EXISTS recomandari_servire;
DROP TABLE IF EXISTS produse;

CREATE TYPE tip_produs AS ENUM('ceai', 'cafea', 'patiserie');
CREATE TYPE livrare AS ENUM('expres', 'standard');
CREATE TYPE recomandari_servire AS ENUM('dimineata', 'pranz', 'seara');

CREATE TABLE IF NOT EXISTS produse (
   id serial PRIMARY KEY, --a
   nume VARCHAR(50) UNIQUE NOT NULL, --b
   descriere TEXT, --c
   imagine VARCHAR(300), --d
   categorie_mare tip_produs DEFAULT 'ceai', --e
   categorie_mica livrare DEFAULT 'standard', --f
   pret NUMERIC(8,2) NOT NULL, --g
   gramaj INT NOT NULL CHECK (gramaj>=0), --h
   data_adaugare TIMESTAMP DEFAULT current_timestamp, --i
   recomandare_servire recomandari_servire DEFAULT 'dimineata',
   ingrediente VARCHAR [],
   contine_cofeina BOOLEAN NOT NULL DEFAULT TRUE
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mihai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mihai;