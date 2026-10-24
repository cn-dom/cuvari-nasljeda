<?php
/**
 * Plugin Name: PatriaSoul – Čuvari nasljeđa Core
 * Description: WordPress temelj za uređive PatriaSoul stranice, virtualni muzej i registar Hrvatska pamti. Ne mijenja postojeću Supabase bazu.
 * Version: 0.2.0
 * Requires at least: 6.2
 * Requires PHP: 7.4
 * Author: PatriaSoul
 * Text Domain: patriasoul-core
 */

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/includes/class-patriasoul-module-manager.php';

final class PatriaSoul_Core {
    const VERSION = '0.2.0';
    const OPTION_APP_URL = 'patriasoul_core_app_url';
    const OPTION_FOOTER_LINE1 = 'patriasoul_core_footer_line1';
    const OPTION_FOOTER_LINE2 = 'patriasoul_core_footer_line2';

    public static function boot() {
        add_action('init', array(__CLASS__, 'register_content_types'));
        add_action('add_meta_boxes', array(__CLASS__, 'add_editor_boxes'));
        add_action('save_post_ps_museum_item', array(__CLASS__, 'save_editor_fields'));
        add_action('save_post_ps_memorial_dossier', array(__CLASS__, 'save_editor_fields'));
        add_action('wp_enqueue_scripts', array(__CLASS__, 'register_assets'));
        add_action('admin_menu', array(__CLASS__, 'add_settings_page'));
        add_action('admin_init', array(__CLASS__, 'register_settings'));
        add_shortcode('patriasoul_portal', array(__CLASS__, 'portal_shortcode'));
        add_shortcode('patriasoul_museum', array(__CLASS__, 'museum_shortcode'));
        add_shortcode('patriasoul_memorials', array(__CLASS__, 'memorials_shortcode'));
        add_shortcode('patriasoul_footer', array(__CLASS__, 'footer_shortcode'));
    }

    public static function activate() {
        self::register_content_types();
        self::create_page(
            'PatriaSoul',
            'patriasoul',
            '[patriasoul_portal]',
            'Početna stranica PatriaSoul portala. Tekst, slike i blokove možete uređivati u WordPressu.'
        );
        self::create_page(
            'Virtualni muzej',
            'virtualni-muzej',
            '[patriasoul_museum]',
            'Uređiva zbirka predmeta i priča hrvatske baštine.'
        );
        self::create_page(
            'Hrvatska pamti',
            'hrvatska-pamti',
            '[patriasoul_memorials]',
            'Dokumentiranje, dostojanstvo i istina. Objavljujte samo provjerene zapise s izvorima.'
        );
        flush_rewrite_rules();
    }

    public static function deactivate() {
        flush_rewrite_rules();
    }

    private static function create_page($title, $slug, $content, $excerpt) {
        $existing = get_page_by_path($slug, OBJECT, 'page');
        if ($existing) {
            return;
        }
        wp_insert_post(array(
            'post_type' => 'page',
            'post_status' => 'draft',
            'post_title' => $title,
            'post_name' => $slug,
            'post_content' => $content,
            'post_excerpt' => $excerpt,
        ));
    }

    public static function register_content_types() {
        register_post_type('ps_museum_item', array(
            'labels' => array(
                'name' => 'Muzejski predmeti',
                'singular_name' => 'Muzejski predmet',
                'add_new_item' => 'Dodaj muzejski predmet',
                'edit_item' => 'Uredi muzejski predmet',
                'menu_name' => 'Virtualni muzej',
            ),
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-building',
            'supports' => array('title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'),
            'has_archive' => false,
            'rewrite' => array('slug' => 'muzejski-predmet'),
        ));

        register_post_type('ps_memorial_dossier', array(
            'labels' => array(
                'name' => 'Dosjei – Hrvatska pamti',
                'singular_name' => 'Memorijalni dosje',
                'add_new_item' => 'Dodaj dosje',
                'edit_item' => 'Uredi dosje',
                'menu_name' => 'Hrvatska pamti',
            ),
            'public' => true,
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-book-alt',
            'supports' => array('title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'),
            'has_archive' => false,
            'rewrite' => array('slug' => 'hrvatska-pamti-dosje'),
        ));
    }

    public static function register_assets() {
        wp_register_style(
            'patriasoul-core',
            plugin_dir_url(__FILE__) . 'assets/patriasoul-core.css',
            array(),
            self::VERSION
        );
    }

    private static function enqueue_assets() {
        wp_enqueue_style('patriasoul-core');
    }

    public static function add_settings_page() {
        add_options_page(
            'PatriaSoul postavke',
            'PatriaSoul',
            'manage_options',
            'patriasoul-core',
            array(__CLASS__, 'render_settings_page')
        );
    }

    public static function register_settings() {
        register_setting('patriasoul_core_settings', self::OPTION_APP_URL, array(
            'type' => 'string',
            'sanitize_callback' => array(__CLASS__, 'sanitize_app_url'),
            'default' => 'https://cuvari-nasljeda.patriasoul.workers.dev/',
        ));
        add_settings_section(
            'patriasoul_core_main',
            'Povezivanje s postojećom aplikacijom',
            function () {
                echo '<p>Ovdje se postavlja poveznica na postojeću aplikaciju. Ova postavka ne povezuje niti premješta korisničke račune i bazu.</p>';
            },
            'patriasoul-core'
        );
        add_settings_field(
            self::OPTION_APP_URL,
            'Adresa postojeće aplikacije',
            array(__CLASS__, 'render_app_url_field'),
            'patriasoul-core',
            'patriasoul_core_main'
        );
        add_settings_field(
            self::OPTION_FOOTER_LINE1,
            'Tekst podnožja – prvi red',
            array(__CLASS__, 'render_footer_line1_field'),
            'patriasoul-core',
            'patriasoul_core_main'
        );
        add_settings_field(
            self::OPTION_FOOTER_LINE2,
            'Tekst podnožja – drugi red',
            array(__CLASS__, 'render_footer_line2_field'),
            'patriasoul-core',
            'patriasoul_core_main'
        );
        register_setting('patriasoul_core_settings', self::OPTION_FOOTER_LINE1, array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'Hrvatska · povijest · znanje · identitet',
        ));
        register_setting('patriasoul_core_settings', self::OPTION_FOOTER_LINE2, array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'Znanje · Ponos · Nasljeđe',
        ));
    }

    public static function sanitize_app_url($value) {
        $url = esc_url_raw(trim((string) $value));
        if (!$url || !wp_http_validate_url($url) || strtolower((string) wp_parse_url($url, PHP_URL_SCHEME)) !== 'https') {
            add_settings_error(self::OPTION_APP_URL, 'invalid_url', 'Unesite valjanu HTTPS adresu.');
            return get_option(self::OPTION_APP_URL, 'https://cuvari-nasljeda.patriasoul.workers.dev/');
        }
        return $url;
    }

    public static function render_app_url_field() {
        printf(
            '<input class="regular-text" type="url" name="%1$s" value="%2$s" placeholder="https://..." />',
            esc_attr(self::OPTION_APP_URL),
            esc_attr(get_option(self::OPTION_APP_URL, 'https://cuvari-nasljeda.patriasoul.workers.dev/'))
        );
        echo '<p class="description">Javna adresa aplikacije, bez API ključeva ili tajnih podataka.</p>';
    }

    public static function render_footer_line1_field() {
        printf(
            '<input class="regular-text" type="text" name="%1$s" value="%2$s" />',
            esc_attr(self::OPTION_FOOTER_LINE1),
            esc_attr(get_option(self::OPTION_FOOTER_LINE1, 'Hrvatska · povijest · znanje · identitet'))
        );
    }

    public static function render_footer_line2_field() {
        printf(
            '<input class="regular-text" type="text" name="%1$s" value="%2$s" />',
            esc_attr(self::OPTION_FOOTER_LINE2),
            esc_attr(get_option(self::OPTION_FOOTER_LINE2, 'Znanje · Ponos · Nasljeđe'))
        );
    }

    /**
     * Place [patriasoul_footer] in the Blocksy footer builder to render
     * the two editable PatriaSoul brand lines without hardcoding a theme hook.
     */
    public static function footer_shortcode($atts = array()) {
        $line1 = get_option(self::OPTION_FOOTER_LINE1, 'Hrvatska · povijest · znanje · identitet');
        $line2 = get_option(self::OPTION_FOOTER_LINE2, 'Znanje · Ponos · Nasljeđe');
        return '<div class="ps-core ps-brand-footer" role="contentinfo">'
            . '<p class="ps-brand-footer__line1">' . esc_html($line1) . '</p>'
            . '<p class="ps-brand-footer__line2">' . esc_html($line2) . '</p>'
            . '</div>';
    }

    public static function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        echo '<div class="wrap"><h1>PatriaSoul – postavke</h1><form method="post" action="options.php">';
        settings_fields('patriasoul_core_settings');
        do_settings_sections('patriasoul-core');
        submit_button('Spremi postavke');
        echo '</form><hr><p><strong>Sigurnosna napomena:</strong> nikad ne unosite Supabase service-role ključ ili druge tajne u ovu postavku, WordPress sadržaj ili javni JavaScript.</p></div>';
    }

    /**
     * Structured editorial fields keep source and verification details separate
     * from narrative copy. Values are saved only by authorized editors.
     */
    public static function add_editor_boxes() {
        add_meta_box(
            'ps_museum_details',
            'Podaci o predmetu i izvorima',
            array(__CLASS__, 'render_editor_box'),
            'ps_museum_item',
            'normal',
            'high'
        );
        add_meta_box(
            'ps_memorial_details',
            'Lokacija, provjera i izvori',
            array(__CLASS__, 'render_editor_box'),
            'ps_memorial_dossier',
            'normal',
            'high'
        );
    }

    public static function render_editor_box($post) {
        wp_nonce_field('ps_save_editor_fields', 'ps_editor_nonce');
        $is_memorial = $post->post_type === 'ps_memorial_dossier';
        $fields = $is_memorial
            ? array(
                'ps_location' => array('Lokacija (mjesto, općina, država)', 'text'),
                'ps_historical_period' => array('Povijesno razdoblje', 'text'),
                'ps_verification_status' => array('Status provjere', 'status'),
                'ps_source_title' => array('Naziv glavnog izvora', 'text'),
                'ps_source_url' => array('Poveznica na izvor', 'url'),
                'ps_source_notes' => array('Bilješke o provjeri / dodatni izvori', 'textarea'),
                'ps_coordinates' => array('Koordinate (samo ako su pouzdano potvrđene)', 'text'),
            )
            : array(
                'ps_object_date' => array('Datacija / razdoblje', 'text'),
                'ps_object_origin' => array('Podrijetlo / mjesto', 'text'),
                'ps_source_title' => array('Naziv glavnog izvora', 'text'),
                'ps_source_url' => array('Poveznica na izvor', 'url'),
                'ps_source_notes' => array('Bilješke o izvoru i atribuciji', 'textarea'),
            );

        echo '<p>Unesite provjerljive podatke. Razlikujte dokumentiranu činjenicu, tumačenje i predaju; ne izmišljajte izvore.</p>';
        foreach ($fields as $key => $definition) {
            $value = get_post_meta($post->ID, $key, true);
            echo '<p><label for="' . esc_attr($key) . '"><strong>' . esc_html($definition[0]) . '</strong></label><br>';
            if ($definition[1] === 'textarea') {
                echo '<textarea class="widefat" rows="3" id="' . esc_attr($key) . '" name="' . esc_attr($key) . '">' . esc_textarea($value) . '</textarea>';
            } elseif ($definition[1] === 'status') {
                $statuses = array(
                    'not_checked' => 'Nije provjereno',
                    'in_review' => 'Provjera u tijeku',
                    'verified' => 'Provjereno',
                    'disputed' => 'Sporni / proturječni podaci',
                );
                echo '<select id="' . esc_attr($key) . '" name="' . esc_attr($key) . '">';
                foreach ($statuses as $status => $label) {
                    echo '<option value="' . esc_attr($status) . '"' . selected($value ?: 'not_checked', $status, false) . '>' . esc_html($label) . '</option>';
                }
                echo '</select>';
            } else {
                echo '<input class="widefat" type="' . esc_attr($definition[1]) . '" id="' . esc_attr($key) . '" name="' . esc_attr($key) . '" value="' . esc_attr($value) . '">';
            }
            echo '</p>';
        }
        if ($is_memorial) {
            echo '<p><strong>Važno:</strong> unesene koordinate same po sebi ne znače da je lokacija potvrđena. U javnom prikazu treba jasno navesti status i izvor.</p>';
        }
    }

    public static function save_editor_fields($post_id) {
        if (
            !isset($_POST['ps_editor_nonce']) ||
            !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['ps_editor_nonce'])), 'ps_save_editor_fields') ||
            (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) ||
            wp_is_post_revision($post_id) ||
            !current_user_can('edit_post', $post_id)
        ) {
            return;
        }

        $is_memorial = get_post_type($post_id) === 'ps_memorial_dossier';
        $keys = $is_memorial
            ? array('ps_location', 'ps_historical_period', 'ps_verification_status', 'ps_source_title', 'ps_source_url', 'ps_source_notes', 'ps_coordinates')
            : array('ps_object_date', 'ps_object_origin', 'ps_source_title', 'ps_source_url', 'ps_source_notes');

        foreach ($keys as $key) {
            if (!isset($_POST[$key])) {
                continue;
            }
            $raw = wp_unslash($_POST[$key]);
            if ($key === 'ps_source_url') {
                $value = esc_url_raw(trim((string) $raw));
                if ($value && strtolower((string) wp_parse_url($value, PHP_URL_SCHEME)) !== 'https') {
                    $value = '';
                }
            } elseif ($key === 'ps_source_notes') {
                $value = sanitize_textarea_field($raw);
            } elseif ($key === 'ps_verification_status') {
                $allowed = array('not_checked', 'in_review', 'verified', 'disputed');
                $value = in_array($raw, $allowed, true) ? $raw : 'not_checked';
            } else {
                $value = sanitize_text_field($raw);
            }
            update_post_meta($post_id, $key, $value);
        }
    }

    private static function portal_cards() {
        $app_url = get_option(self::OPTION_APP_URL, 'https://cuvari-nasljeda.patriasoul.workers.dev/');
        $cards = array(
            array('title' => 'Čuvari nasljeđa', 'text' => 'Zajednica posvećena hrvatskoj baštini, znanju i identitetu.', 'url' => $app_url, 'external' => true),
            array('title' => 'Kviz', 'text' => 'Provjeri znanje o hrvatskoj povijesti, kulturi i baštini.', 'url' => trailingslashit($app_url) . 'kviz/', 'external' => true),
            array('title' => 'Virtualni muzej', 'text' => 'Uređiv zbirka predmeta, zapisa i priča.', 'url' => home_url('/virtualni-muzej/'), 'external' => false),
            array('title' => 'Hrvatska pamti', 'text' => 'Dokumentiranje memorijalnih mjesta uz provjerljive izvore.', 'url' => home_url('/hrvatska-pamti/'), 'external' => false),
        );
        return $cards;
    }

    public static function portal_shortcode($atts = array()) {
        self::enqueue_assets();
        $cards = self::portal_cards();
        ob_start();
        ?>
        <section class="ps-core ps-portal" aria-labelledby="ps-portal-title">
            <div class="ps-core__hero">
                <p class="ps-core__eyebrow">VJERA · OBITELJ · DOMOVINA</p>
                <h2 id="ps-portal-title">Hrvatska. Povijest. Znanje. Identitet.</h2>
                <p>Upoznaj Hrvatsku. Čuvaj baštinu. Prenesi priču.</p>
            </div>
            <div class="ps-core__grid">
                <?php foreach ($cards as $card) : ?>
                    <article class="ps-core__card">
                        <h3><?php echo esc_html($card['title']); ?></h3>
                        <p><?php echo esc_html($card['text']); ?></p>
                        <a class="ps-core__link" href="<?php echo esc_url($card['url']); ?>"<?php echo $card['external'] ? ' target="_blank" rel="noopener noreferrer"' : ''; ?>>
                            Otvori <span aria-hidden="true">→</span>
                        </a>
                    </article>
                <?php endforeach; ?>
            </div>
            <p class="ps-core__footer">Znanje · Ponos · Nasljeđe</p>
        </section>
        <?php
        return ob_get_clean();
    }

    private static function render_public_metadata($post_id) {
        $post_type = get_post_type($post_id);
        $rows = array();
        if ($post_type === 'ps_memorial_dossier') {
            $location = get_post_meta($post_id, 'ps_location', true);
            $period = get_post_meta($post_id, 'ps_historical_period', true);
            $status = get_post_meta($post_id, 'ps_verification_status', true) ?: 'not_checked';
            if ($location) {
                $rows[] = '<span><strong>Lokacija:</strong> ' . esc_html($location) . '</span>';
            }
            if ($period) {
                $rows[] = '<span><strong>Razdoblje:</strong> ' . esc_html($period) . '</span>';
            }
            $labels = array(
                'not_checked' => 'Status: nije provjereno',
                'in_review' => 'Status: provjera u tijeku',
                'verified' => 'Status: provjereno',
                'disputed' => 'Status: sporni / proturječni podaci',
            );
            $rows[] = '<span class="ps-core__status ps-core__status--' . esc_attr($status) . '">' . esc_html(isset($labels[$status]) ? $labels[$status] : $labels['not_checked']) . '</span>';
        } else {
            $date = get_post_meta($post_id, 'ps_object_date', true);
            $origin = get_post_meta($post_id, 'ps_object_origin', true);
            if ($date) {
                $rows[] = '<span><strong>Datacija:</strong> ' . esc_html($date) . '</span>';
            }
            if ($origin) {
                $rows[] = '<span><strong>Podrijetlo:</strong> ' . esc_html($origin) . '</span>';
            }
        }

        $source_title = get_post_meta($post_id, 'ps_source_title', true);
        $source_url = get_post_meta($post_id, 'ps_source_url', true);
        if ($source_title && $source_url && strtolower((string) wp_parse_url($source_url, PHP_URL_SCHEME)) === 'https') {
            $rows[] = '<span class="ps-core__source">Izvor: <a href="' . esc_url($source_url) . '" target="_blank" rel="noopener noreferrer">' . esc_html($source_title) . '</a></span>';
        } elseif ($source_title) {
            $rows[] = '<span class="ps-core__source">Izvor: ' . esc_html($source_title) . '</span>';
        }

        if (!$rows) {
            return;
        }
        echo '<div class="ps-core__metadata">' . implode('', array_map(function ($row) { return '<p>' . $row . '</p>'; }, $rows)) . '</div>';
    }

    private static function archive_shortcode($post_type, $title, $description, $empty_message) {
        self::enqueue_assets();
        $items = new WP_Query(array(
            'post_type' => $post_type,
            'post_status' => 'publish',
            'posts_per_page' => 12,
            'orderby' => 'date',
            'order' => 'DESC',
            'no_found_rows' => true,
        ));
        ob_start();
        ?>
        <section class="ps-core ps-archive">
            <header class="ps-core__section-head">
                <p class="ps-core__eyebrow">PATRIA SOUL · ČUVARI NASLJEĐA</p>
                <h2><?php echo esc_html($title); ?></h2>
                <p><?php echo esc_html($description); ?></p>
            </header>
            <?php if ($items->have_posts()) : ?>
                <div class="ps-core__grid">
                    <?php while ($items->have_posts()) : $items->the_post(); ?>
                        <article class="ps-core__card">
                            <?php if (has_post_thumbnail()) : ?>
                                <a class="ps-core__image" href="<?php the_permalink(); ?>"><?php the_post_thumbnail('large', array('loading' => 'lazy')); ?></a>
                            <?php endif; ?>
                            <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                            <?php self::render_public_metadata(get_the_ID()); ?>
                            <p><?php echo esc_html(wp_trim_words(get_the_excerpt() ?: wp_strip_all_tags(get_the_content()), 32)); ?></p>
                            <a class="ps-core__link" href="<?php the_permalink(); ?>">Otvori opis <span aria-hidden="true">→</span></a>
                        </article>
                    <?php endwhile; ?>
                </div>
            <?php else : ?>
                <div class="ps-core__empty">
                    <p><?php echo esc_html($empty_message); ?></p>
                    <?php if (current_user_can('edit_posts')) : ?>
                        <p>Administrator može dodati sadržaj kroz izbornik <strong><?php echo esc_html($title); ?></strong> u WordPress nadzornoj ploči.</p>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </section>
        <?php
        wp_reset_postdata();
        return ob_get_clean();
    }

    public static function museum_shortcode($atts = array()) {
        return self::archive_shortcode(
            'ps_museum_item',
            'Virtualni muzej',
            'Predmeti, dokumenti i priče koji čuvaju hrvatsku kulturnu i povijesnu baštinu.',
            'Zbirka se priprema. Novi predmeti i priče bit će objavljeni nakon uredničke provjere.'
        );
    }

    public static function memorials_shortcode($atts = array()) {
        return self::archive_shortcode(
            'ps_memorial_dossier',
            'Hrvatska pamti',
            'Dokumentiranje · Dostojanstvo · Istina. Svaki dosje treba jasno navesti izvore i status provjere.',
            'Registar se priprema. Objavljujte samo zapise koji imaju pouzdane izvore i jasno označen status provjere.'
        );
    }
}

PatriaSoul_Core::boot();
register_activation_hook(__FILE__, array('PatriaSoul_Core', 'activate'));
register_deactivation_hook(__FILE__, array('PatriaSoul_Core', 'deactivate'));
