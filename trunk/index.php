<?php
require (ABSPATH . WPINC . '/pluggable.php');
/*
Plugin Name: Scroll Triggered Box
Plugin URI: http://dreamgrow.com
Description: Scroll Triggered Box
Version: 1.0
Author: Dreamgrow Digital
Author URI: http://dreamgrow.com
License: GPL2
*/
class ScrollBox
{
    function __construct()
    {
        if (is_admin()) {
            add_action('admin_menu', array($this, 'sdb_admin_menu'));
            add_action('admin_init', array($this, 'sdb_register_settings'));
            add_filter('plugin_row_meta', array($this, 'donate_link'), 10, 2);
        }
        add_action('wp_footer', array($this, 'sdb_footer_include'));
        add_action('wp_enqueue_scripts', array($this, 'sdb_enqueue_scripts'));
//        unset($_COOKIE['nopopup']);
    }

    function donate_link($links, $file)
    {
        if ($file == plugin_basename(__FILE__)) {
            $donate_link = '<a target="_blank" href=" https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=B4NCTTDR9MEPW">Donate</a>';
            $links[] = $donate_link;
        }
        return $links;
    }

    function sdb_visible()
    {
        $options = get_option('sdb_settings');
        $frontpage_id = get_option('page_on_front');
        global $post;
        $postID = $post->ID;
        $current = get_post_type($postID);

        // Visible to admins only
        if ($options['show_admin']) {
            $current_user = wp_get_current_user();
            if ($current_user->user_level < 8)
                return false;
        }

        // Show on frontpage
        if ($frontpage_id == $postID && isset($options['show']['frontpage']))
            return true;

        // Visible at
        if (!isset($options['show'][$current]))
            return false;

        return true;
    }

    function sdb_footer_include()
    {
        // Vars
        $options = get_option('sdb_settings');
        $template = $options['theme'];
        $content = get_option('sdb_html');
        $closed = (isset($_COOKIE['nopopup'])) ? 'true' : 'false';

        // Add css
        if ($this->sdb_visible()) {
            if ($options['include_css'] == 1) echo '<link rel="stylesheet" type="text/css" media="screen" href="' . WP_PLUGIN_URL . '/scrollBox/templates/' . $template . '/style.css" />';

            // Box html
            echo '<div id="scrolldriggered" style="width: ' . $options['width'] . 'px;' . $options['position'] . ': 10px"><div id="inscroll">
                  <a href="#close" id="closebox">x</a>' .
                 $content
                 . '</div></div>';

            // JS variables
            echo '<script type="text/javascript">
                    var hascolsed = ' . $closed . ';
                    var cookieLife = ' . $options['cookie_life'] . ';
                    var triggerHeight = ' . $options['trigger_height'] . ';
                    var sdbElement = "' . $options['trigger_element'] . '";';
            echo '</script>';
        }
    }

    function sdb_enqueue_scripts()
    {
        if ($this->sdb_visible()) {
            wp_enqueue_script('jquery');
            wp_enqueue_script(
                'sdb_script',
                WP_PLUGIN_URL . '/scrollBox/stb_init.js',
                array('jquery')
            );
            wp_enqueue_script(
                'jquery_cookie',
                WP_PLUGIN_URL . '/scrollBox/jquery.cookie.js',
                array('jquery')
            );
        }
    }

    // Register settings
    function sdb_register_settings()
    {
        register_setting('sdb_options', 'sdb_settings');
        register_setting('sdb_options', 'sdb_html');
    }

    function get_templates($current)
    {
        $dir = WP_PLUGIN_DIR . '/scrollBox/templates/';
        if ($handle = opendir($dir)) {
            $templates = '';
            while (false !== ($entry = readdir($handle))) {
                if ($entry != '.' && $entry != '..')
                    if (is_dir(($dir . $entry)))
                        $templates .= '<option ' . selected($entry, $current) . ' value="' . $entry . '">' . ucfirst(str_replace('_', ' ', $entry)) . '</option>';
            }
            closedir($handle);
            return $templates;
        }
        return false;
    }

    function sdb_admin_settings_page()
    {
        ?>
    <div class=wrap style="padding-top: 10px;">
        <div id="icon-options-general" class="icon32"><br></div>
        <h2>Scroll Triggered Box</h2>

        <div class="widget-liquid-left">
            <div id="widgets-left">
                <div id="available-widgets" class="widgets-holder-wrap ui-droppable">
                    <div class="sidebar-name">
                        <h3>Options</h3>
                    </div>
                    <div class="widget-holder">
                        <form method="post" action="options.php">
                            <?php
                            settings_fields('sdb_options');
                            $defaults = array(
                                'cookie_life' => 30,
                                'trigger_height' => 80,
                                'trigger_element' => '',
                                'width' => '300',
                                'position' => 'right',
                                'include_css' => 1,
                                'show' => array(
                                    'page' => 'page',
                                    'post' => 'post'
                                ),
                                'theme' => 'default'
                            );
                            $sampleHtml = '<h5>Sign up for Social Media News</h5>
                                            <ul>
                                            <li>Social media news</li>
                                            <li>Social media news</li>
                                            <li>Social media news</li>
                                            <ul>
                                            Enter your email and stay on top of things,
                                            <form>
                                            <input>
                                            <input type="submit">
                                            </form>';
                            $options = get_option('sdb_settings', $defaults);
                            $formHTML = get_option('sdb_html', $sampleHtml);
                            ?>
                            <table class="form-table">
                                <tbody>
                                <tr valign="top">
                                    <th scope="row"><label for="btheme">Theme</label></th>
                                    <td>
                                        <select name="sdb_settings[theme]" id="btheme">
                                            <?php echo $this->get_templates($options['theme']); ?>
                                        </select>
                                        Theme selection
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <th scope="row"><label for="show_admin">Testing</label></th>
                                    <td>
                                        <input name="sdb_settings[show_admin]" type="checkbox" id="show_admin"
                                               value="1" <?php checked('1', $options['show_admin']); ?> />
                                        Show box to admins only.
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <th scope="row">Visible at</th>
                                    <td>
                                        <input name="sdb_settings[show][page]" type="checkbox" id="bpages"
                                               class="tog" <?php checked('on', $options['show']['page']); ?>><label
                                            for="bpages">Pages</label><br/>
                                        <input name="sdb_settings[show][post]" type="checkbox" id="bposts"
                                               class="tog" <?php checked('on', $options['show']['post']); ?>><label
                                            for="bposts">Posts</label><br/>
                                        <input name="sdb_settings[show][frontpage]" type="checkbox" id="bfpage"
                                               class="tog" <?php checked('on', $options['show']['frontpage']); ?>><label
                                            for="bfpage">Frontpage</label>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <th scope="row"><label for="lifetime">Cookie lifetime</label></th>
                                    <td><input name="sdb_settings[cookie_life]" type="text" id="lifetime"
                                               value="<?php echo $options['cookie_life']; ?>" class="small-text">
                                        Ammount of days for the box to stay hidden, when the user has closed it.
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <th scope="row"><label for="trigh">Show box at</label></th>
                                    <td><input name="sdb_settings[trigger_height]" type="text" id="trigh"
                                               value="<?php echo $options['trigger_height']; ?>" class="small-text">
                                        Box will be shown when the user has scrolled selected percentage of total
                                        document height.
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <th scope="row"><label for="trigelem">Show box at element</label></th>
                                    <td>
                                        <input name="sdb_settings[trigger_element]" type="text" id="trigelem"
                                               value="<?php echo $options['trigger_element']; ?>" class="regular-text">
                                        class or id of the element to show the box at. Leave empty to use the percentage
                                        setting.<br/>
                                        For example: <strong>#comments</strong> - at the beginning of comments section
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <th scope="row"><label for="includecss">Include css</label></th>
                                    <td>
                                        <input name="sdb_settings[include_css]" type="checkbox" id="includecss"
                                               value="1" <?php checked('1', $options['include_css']); ?> />
                                        Uncheck only if you want to style the box by yourself via themes css. CSS file
                                        is located <a
                                            href="<?php echo WP_PLUGIN_URL . '/scrollBox/templates/' . $options['theme'] . '/style.css' ?>">here</a>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <th scope="row">Box position</th>
                                    <td>
                                        <input name="sdb_settings[position]" type="radio" value="right" id="bright"
                                               class="tog" <?php checked('right', $options['position']); ?>><label
                                            for="bright">Right</label><br/>
                                        <input name="sdb_settings[position]" type="radio" value="left" id="bleft"
                                               class="tog" <?php checked('left', $options['position']); ?>><label
                                            for="bleft">Left</label>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <th scope="row"><label for="bwidth">Box width</label></th>
                                    <td><input name="sdb_settings[width]" type="text" id="bwidth"
                                               value="<?php echo $options['width']; ?>" class="small-text">
                                        Width of the box in px.
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <th scope="row"><label for="moderation_keys">Box html</label></th>
                                    <td>Content of the box. You are allowed to use HTML.
                                        <textarea name="sdb_html" rows="10" cols="50" id="moderation_keys"
                                                  class="large-text code"><?php echo htmlspecialchars($formHTML); ?></textarea>
                                    </td>
                                </tr>
                                </tbody>
                            </table>


                            <p class="button-controls" style="margin-left: 10px;"><input type="submit" name="submit"
                                                                                         id="submit"
                                                                                         class="button-primary"
                                                                                         value="Save Changes"></p>
                        </form>
                    </div>

                </div>
                <br class="clear">
            </div>


        </div>
        <div class="widget-liquid-right">
            <div id="widgets-right">

                <div class="widgets-holder-wrap">
                    <div class="sidebar-name">
                        <h3>Like this plugin?</h3></div>
                    <div id="sidaber-widget" class="widgets-sortables">
                        <div class="sidebar-description">
                            <p class="description">Why not do any of the following:</p>

                            <p>Link to it so other folks can find out about it.</p>

                            <p>Give it a good rating on WordPress.org.</p>

                            <p>Donate a token of your appreciation!</p>

                            <p><a href="http://dreamgrow.com" target="_blank">Visit plugin site</a></p>

                            <form action="https://www.paypal.com/cgi-bin/webscr" method="post"
                                  style="text-align: center;">
                                <input type="hidden" name="cmd" value="_s-xclick">
                                <input type="hidden" name="hosted_button_id" value="B4NCTTDR9MEPW">
                                <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
                                       border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
                                <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
                                     width="1" height="1">
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
                            <?php

    }

    //Adds menu link to Settings tab in admin panel
    function sdb_admin_menu()
    {
        add_submenu_page('options-general.php', 'Scroll Triggered Box', 'Scroll Triggered Box', 'manage_options', 'stbox', array($this, 'sdb_admin_settings_page'));
    }
}

$stb = new ScrollBox();
?>