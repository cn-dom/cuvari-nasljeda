<?php
/**
 * Extensible module registry for PatriaSoul Core.
 *
 * Optional features live in independent plugins. This page only reports their
 * installation state; it does not activate plugins or modify their data.
 */

if (!defined('ABSPATH')) {
    exit;
}

final class PatriaSoul_Module_Manager {
    public static function boot() {
        add_action('admin_menu', array(__CLASS__, 'register_page'));
    }

    public static function default_modules() {
        $modules = array(
            'community' => array(
                'name' => 'Zajednica i forum',
                'slug' => 'patriasoul-community/patriasoul-community.php',
                'description' => 'Profili, Zid, objave, komentari, grupe, poruke i obavijesti.',
                'stage' => 'Planirana migracija',
            ),
            'quiz' => array(
                'name' => 'Hrvatski kvizovi',
                'slug' => 'patriasoul-quiz/patriasoul-quiz.php',
                'description' => 'Hrvatski kviz, Brani svoj grad, Dnevni kviz, rezultati i značke.',
                'stage' => 'Planirana migracija',
            ),
            'media' => array(
                'name' => 'Mediji i player',
                'slug' => 'patriasoul-media/patriasoul-media.php',
                'description' => 'Videoarhiv, glazbeni player, omiljeno i red reprodukcije.',
                'stage' => 'Planirana migracija',
            ),
            'integrations' => array(
                'name' => 'Integracije',
                'slug' => 'patriasoul-integrations/patriasoul-integrations.php',
                'description' => 'Povezivanje s postojećim servisima i vanjskim izvorima.',
                'stage' => 'Planirana migracija',
            ),
        );

        /**
         * Other PatriaSoul plugins can add entries without editing Core.
         *
         * @param array $modules Module definitions keyed by a stable module ID.
         */
        return apply_filters('patriasoul_core_modules', $modules);
    }

    public static function register_page() {
        add_submenu_page(
            'options-general.php',
            'PatriaSoul moduli',
            'PatriaSoul moduli',
            'manage_options',
            'patriasoul-modules',
            array(__CLASS__, 'render_page')
        );
    }

    private static function module_status($plugin_file) {
        if (!function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $absolute_path = WP_PLUGIN_DIR . '/' . $plugin_file;
        if (!file_exists($absolute_path)) {
            return array('label' => 'Nije instaliran', 'class' => 'ps-module-status--missing');
        }
        if (is_plugin_active($plugin_file)) {
            return array('label' => 'Aktivan', 'class' => 'ps-module-status--active');
        }
        return array('label' => 'Instaliran, nije aktivan', 'class' => 'ps-module-status--inactive');
    }

    public static function render_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        $modules = self::default_modules();
        echo '<div class="wrap ps-module-admin">';
        echo '<h1>PatriaSoul – moduli</h1>';
        echo '<p>Funkcionalnosti se razvijaju kao odvojeni dodaci. Ovaj pregled prikazuje stanje modula; ne aktivira dodatke i ne mijenja postojeće podatke.</p>';
        echo '<p><strong>Pravilo migracije:</strong> prvo provjeravamo postojeću prijavu, bazu i prava pristupa, a tek zatim zamjenjujemo funkcionalnost starog sustava.</p>';

        if (empty($modules)) {
            echo '<p>Trenutačno nema registriranih dodatnih modula.</p>';
        } else {
            echo '<table class="widefat striped"><thead><tr>';
            echo '<th scope="col">Modul</th><th scope="col">Namjena</th><th scope="col">Stanje dodatka</th><th scope="col">Faza</th>';
            echo '</tr></thead><tbody>';
            foreach ($modules as $key => $module) {
                if (!is_array($module) || empty($module['name']) || empty($module['slug'])) {
                    continue;
                }
                $status = self::module_status($module['slug']);
                $description = isset($module['description']) ? $module['description'] : '';
                $stage = isset($module['stage']) ? $module['stage'] : 'Nije navedeno';
                echo '<tr>';
                echo '<th scope="row">' . esc_html($module['name']) . '</th>';
                echo '<td>' . esc_html($description) . '</td>';
                echo '<td><span class="ps-module-status ' . esc_attr($status['class']) . '">' . esc_html($status['label']) . '</span></td>';
                echo '<td>' . esc_html($stage) . '</td>';
                echo '</tr>';
            }
            echo '</tbody></table>';
        }

        echo '<h2>Kako se dodaje novi modul?</h2>';
        echo '<p>Napravite zaseban WordPress dodatak, provjerite da je PatriaSoul Core aktivan i registrirajte modul kroz filtar <code>patriasoul_core_modules</code>. Novi modul ne treba mijenjati datoteke teme ni jezgru.</p>';
        echo '<p><strong>Napomena:</strong> prikaz modula nije potvrda da je migracija funkcionalnosti dovršena. Stvarni prijenos svakog modula uključuje povezivanje, sigurnosne provjere i testiranje.</p>';
        echo '</div>';
    }
}

PatriaSoul_Module_Manager::boot();
