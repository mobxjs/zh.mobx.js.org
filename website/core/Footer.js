/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react")

class Footer extends React.Component {
    docUrl(doc, language) {
        const baseUrl = this.props.config.baseUrl
        const docsUrl = this.props.config.docsUrl
        const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`
        const langPart = `${language ? `${language}/` : ""}`
        return `${baseUrl}${docsPart}${langPart}${doc}`
    }

    pageUrl(doc, language) {
        const baseUrl = this.props.config.baseUrl
        return baseUrl + (language ? `${language}/` : "") + doc
    }

    render() {
        return (
            <footer className="nav-footer" id="footer">
                <section className="sitemap">
                    <a href={this.props.config.baseUrl} className="nav-home">
                        {this.props.config.footerIcon && (
                            <img
                                src={this.props.config.baseUrl + this.props.config.footerIcon}
                                alt={this.props.config.title}
                                width="66"
                                height="58"
                            />
                        )}
                    </a>
                    <div>
                        <h5>Docs</h5>
                        <a href={this.docUrl("README.html#introduction")}>About MobX</a>
                        <a href={this.docUrl("the-gist-of-mobx.html")}>The gist of MobX</a>
                    </div>
                    <div>
                        <h5>Community</h5>
                        <a href="https://github.com/mobxjs/mobx/discussions" target="_blank" rel="noreferrer noopener">GitHub discussions (NEW)</a>
                        <a
                            href="https://stackoverflow.com/questions/tagged/mobx"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            Stack Overflow
                        </a>
                    </div>
                    <div>
                        <h5>More</h5>
                        <a
                            className="github-button"
                            href={this.props.config.repoUrl}
                            data-icon="octicon-star"
                            data-count-href="/facebook/docusaurus/stargazers"
                            data-show-count="true"
                            data-count-aria-label="# stargazers on GitHub"
                            aria-label="Star this project on GitHub"
                        >
                            Star
                        </a>
                        <a href="https://vercel.com/?utm_source=mobxjs&utm_campaign=oss" target="_blank"><img src="/img/powered-by-vercel.svg" /></a>
                        {this.props.config.twitterUsername && (
                            <div className="social">
                                <a
                                    href={`https://twitter.com/${this.props.config.twitterUsername
                                        }`}
                                    className="twitter-follow-button"
                                >
                                    Follow @{this.props.config.twitterUsername}
                                </a>
                            </div>
                        )}
                        {this.props.config.facebookAppId && (
                            <div className="social">
                                <div
                                    className="fb-like"
                                    data-href={this.props.config.url}
                                    data-colorscheme="dark"
                                    data-layout="standard"
                                    data-share="true"
                                    data-width="225"
                                    data-show-faces="false"
                                />
                            </div>
                        )}
                    </div>
                </section>
                <script src="https://cdn.jsdelivr.net/npm/@docsearch/js@3"></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                          docsearch({
                            appId: 'UBJ6A0HIGD',
                            apiKey: '0b16b32c8604cdba3014d883c0d28b47',
                            indexName: 'mobx-js',
                            container: '.algolia-autocomplete'
                            debug: false // Set debug to true if you want to inspect the modal
                          });             
                    `
                }}>
                </script>
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-HS7DZGLK79"></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
        
                        gtag('config', 'G-HS7DZGLK79');               
                    `
                }}>
                </script>
            </footer>
        )
    }
}

module.exports = Footer
