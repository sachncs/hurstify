## Classes

<dl>
<dt><a href="#HurstifyError">HurstifyError</a> ⇐ <code>Error</code></dt>
<dd><p>hurstify-specific error with a stable <code>code</code> field.</p>
</dd>
<dt><a href="#Hurstify">Hurstify</a></dt>
<dd><p>Randomized Kolmogorov-Smirnov Analysis of Volatility Roughness
estimator.</p>
<p>Wraps the configuration (scales, sample size, sampler, optimizer, KS
objective, h bounds) and exposes the same public API as v1.x — but
every pluggable concern now lives behind a strategy.</p>
<p>Lifecycle:</p>
<ol>
<li>The constructor stores the configuration and resolves the
sampler / KS-objective / optimizer strategies once. The estimator
is therefore stateful across calls — each call to
<a href="#Hurstify+estimate">estimate</a> draws a fresh independent PRNG state
via <code>prng.js</code>.</li>
<li><a href="#Hurstify+estimate">estimate</a> averages <code>iterations</code> independent
<a href="#Hurstify+estimateSingle">estimateSingle</a> results for variance reduction.</li>
<li><a href="#Hurstify+rolling">rolling</a> and <a href="#Hurstify+rollingMultiScale">rollingMultiScale</a>
are convenience wrappers around a sliding window of these
estimates.</li>
<li><a href="#Hurstify+estimateBatch">estimateBatch</a> performs non-overlapping window
estimation for parallel processing pipelines.</li>
</ol>
</dd>
<dt><a href="#Optimizer">Optimizer</a></dt>
<dd><p>Strategy base class. Subclasses implement <code>minimize</code> polymorphically.</p>
</dd>
<dt><a href="#Forecaster">Forecaster</a></dt>
<dd><p>Abstract base class for H-series forecasters.</p>
</dd>
<dt><a href="#ArfimaForecaster">ArfimaForecaster</a></dt>
<dd><p>ARFIMA(p, d, q) forecaster.</p>
</dd>
<dt><a href="#HoltWintersForecaster">HoltWintersForecaster</a></dt>
<dd><p>Holt-Winters (level + trend) forecaster.</p>
</dd>
<dt><a href="#LstmForecaster">LstmForecaster</a></dt>
<dd><p>Stateless LSTM-like recurrent cell forecaster.</p>
</dd>
<dt><a href="#AttentionForecaster">AttentionForecaster</a></dt>
<dd><p>Stateless single-head self-attention block forecaster.</p>
</dd>
<dt><a href="#HypothesisTest">HypothesisTest</a></dt>
<dd></dd>
<dt><a href="#KsSignificanceTest">KsSignificanceTest</a></dt>
<dd><p>KS-distance significance test on the minimized statistic returned by
<code>Hurstify.estimateSingle</code>.</p>
<p>Under the null of self-similarity at the estimated <code>H</code> the minimized
KS distance should be near the asymptotic critical value; rejecting
the null suggests the estimator should be treated with caution.</p>
</dd>
<dt><a href="#ConstancyTest">ConstancyTest</a></dt>
<dd><p>Likelihood-ratio constancy test for a series of H estimates under a
1D Kalman-filter state-space model.</p>
</dd>
<dt><a href="#CusumBreakTest">CusumBreakTest</a></dt>
<dd><p>One-sided CUSUM structural-break detector on standardized residuals.</p>
</dd>
<dt><a href="#BootstrapConfidenceInterval">BootstrapConfidenceInterval</a></dt>
<dd><p>Percentile bootstrap CI for an arbitrary estimator function.</p>
</dd>
<dt><a href="#Kernel">Kernel</a></dt>
<dd><p>Abstract base class for fractional-integration kernels.</p>
</dd>
<dt><a href="#RiemannLiouvilleKernel">RiemannLiouvilleKernel</a></dt>
<dd><p>Riemann–Liouville kernel <code>K(t) = sqrt(2 H) * t^{H - 0.5}</code> for
<code>H in (0, 1)</code> and <code>t &gt; 0</code>.</p>
<p>This is the kernel of choice for rBergomi and the exact-OU / mPRE
simulators.</p>
</dd>
<dt><a href="#TimeVaryingKernel">TimeVaryingKernel</a></dt>
<dd><p>Time-varying kernel whose local exponent <code>H(t)</code> is sampled at every
step. The kernel evaluator picks the exponent based on <code>t</code>:</p>
<pre><code>K(t) = sqrt(2 * H(t)) * t^{H(t) - 0.5}
</code></pre>
<p>The caller supplies a <code>hPath</code> array whose <code>i</code>-th entry is the local
Hurst exponent at time <code>i * dt</code>. When <code>H(t)</code> is constant the kernel
collapses to the Riemann–Liouville form.</p>
</dd>
<dt><a href="#KsObjective">KsObjective</a></dt>
<dd><p>Abstract base class for KS-distance objectives.</p>
</dd>
<dt><a href="#PairwiseKsObjective">PairwiseKsObjective</a></dt>
<dd><p>Two-scale pairwise KS objective.</p>
<p>Rescales the two sorted samples by <code>scales[i]^{-H}</code> and returns the
KS distance between them.</p>
</dd>
<dt><a href="#MultiScaleKsObjective">MultiScaleKsObjective</a></dt>
<dd><p>Multi-scale unweighted KS objective.</p>
<p>Returns the arithmetic mean of the pairwise KS distances over every
unordered pair <code>(i, j)</code> with <code>i &lt; j</code>. Equivalent to the paper&#39;s
recommended extension to <code>K &gt; 2</code> scales.</p>
</dd>
<dt><a href="#WeightedMultiScaleKsObjective">WeightedMultiScaleKsObjective</a></dt>
<dd><p>Multi-scale weighted KS objective.</p>
<p>Weights the pair <code>(i, j)</code> by <code>weights[i] * weights[j]</code> and normalizes
by the sum of those weights so the result stays in <code>[0, 1]</code> regardless
of the absolute weight magnitudes.</p>
</dd>
<dt><a href="#StochasticModel">StochasticModel</a></dt>
<dd><p>Abstract base class for stochastic-process simulators.</p>
</dd>
<dt><a href="#RoughBergomiModel">RoughBergomiModel</a></dt>
<dd><p>Rough Bergomi model.</p>
<pre><code>dV_t / V_t = eta * dW^perp_t
I_t = int_0^t sqrt(2H) (t - s)^{H - 0.5} dW^perp_s
V_t = xi * exp(eta I_t - (eta^2 / 2) t^{2H})
</code></pre>
</dd>
<dt><a href="#RoughFsvModel">RoughFsvModel</a></dt>
<dd><p>Rough Fractional Stochastic Volatility model.</p>
<pre><code>dV_t = theta (mu - V_t) dt + nu V_t^alpha dW^V_t + roughComp
</code></pre>
</dd>
<dt><a href="#FractionalOuModel">FractionalOuModel</a></dt>
<dd><p>Abstract base class for the Fractional Ornstein-Uhlenbeck model.</p>
<pre><code>dX_t = theta (mu - X_t) dt + sigma dB^H_t
</code></pre>
<p>Concrete subclasses pick the discretization scheme:</p>
<ul>
<li><a href="#EulerMaruyamaFractionalOuModel">EulerMaruyamaFractionalOuModel</a> — default, cheap</li>
<li><a href="#ExactFractionalOuModel">ExactFractionalOuModel</a> — Riemann-Liouville integral, accurate</li>
</ul>
</dd>
<dt><a href="#EulerMaruyamaFractionalOuModel">EulerMaruyamaFractionalOuModel</a></dt>
<dd><p>Euler-Maruyama discretization of the fOU model.</p>
<p>Cheap O(n) integration; first-order accurate.</p>
</dd>
<dt><a href="#ExactFractionalOuModel">ExactFractionalOuModel</a></dt>
<dd><p>Exact Riemann-Liouville discretization of the fOU model.</p>
<p>O(n^2) per path; higher-order accurate.</p>
</dd>
<dt><a href="#MultifractionalPreModel">MultifractionalPreModel</a></dt>
<dd><p>Abstract base class for the Multifractional Process with Random
Exponent.</p>
<pre><code>X_t = B_{H(t)}(t)
</code></pre>
<p>where <code>H(t)</code> itself is a stochastic Ornstein-Uhlenbeck process
bounded between <code>hMin</code> and <code>hMax</code>. Two concrete subclasses pick the
discretization scheme:</p>
<ul>
<li><a href="#LocalHolderMultifractionalPreModel">LocalHolderMultifractionalPreModel</a> — default, cheap</li>
<li><a href="#ExactMultifractionalPreModel">ExactMultifractionalPreModel</a> — time-varying kernel</li>
</ul>
</dd>
<dt><a href="#LocalHolderMultifractionalPreModel">LocalHolderMultifractionalPreModel</a></dt>
<dd><p>Local-Holder approximation of the mPRE model.</p>
<p>Cheap O(n) integration via cumulative <code>sqrt(dt^{2 * H_avg})</code> scaling.</p>
</dd>
<dt><a href="#ExactMultifractionalPreModel">ExactMultifractionalPreModel</a></dt>
<dd><p>Exact time-varying-kernel discretization of the mPRE model.</p>
<p>O(n^2) per path; uses a time-varying Riemann-Liouville kernel.</p>
</dd>
<dt><a href="#Sampler">Sampler</a></dt>
<dd><p>Abstract base class for sampling strategies.</p>
<p>A <code>Sampler</code> is a <em>strategy</em>: callers obtain a fresh instance and
invoke <code>draw(inc, n)</code> once per variance-reduction iteration. The
estimator never holds sampler state across calls so strategies can be
safely shared across estimator instances.</p>
</dd>
<dt><a href="#ReservoirSampler">ReservoirSampler</a></dt>
<dd><p>Floyd&#39;s Algorithm R reservoir sampler wrapped as a <code>Sampler</code> strategy.</p>
<p>Complexity: <code>O(inc.length)</code> time, <code>O(n)</code> extra memory. Reproducible
when <code>prng.setRandomSeed()</code> has been called.</p>
</dd>
<dt><a href="#BlockPermutationSampler">BlockPermutationSampler</a></dt>
<dd><p>Block random permutation followed by a reservoir draw.</p>
<p>This is the paper-faithful RK-SAVR pipeline: the increments are first
sliced into blocks of length <code>blockSize</code> (optionally with a random
phase offset) and the blocks are shuffled, then the desired number of
increments is drawn without replacement from the permuted array.</p>
</dd>
<dt><a href="#IdentitySampler">IdentitySampler</a></dt>
<dd><p>Identity sampler — returns the input unchanged.</p>
<p>Useful when the caller has already prepared an array of exactly <code>n</code>
elements (e.g. in deterministic unit tests).</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#NORMAL_QUANTILE_COEFFS">NORMAL_QUANTILE_COEFFS</a></dt>
<dd><p>Coefficients for the Beasley-Springer-Malkin rational approximation of
the inverse standard normal CDF. Used piecewise for <code>p in [pLow, 1 - pLow]</code> (central region) and tail rational functions for the extremes.</p>
<p>The standard deviation may be <code>c/d</code> constants at the tails is adapted
from Peter Acklam&#39;s algorithm.</p>
</dd>
<dt><a href="#modelRegistry">modelRegistry</a> : <code><a href="#StochasticModel">Registry.&lt;StochasticModel&gt;</a></code></dt>
<dd><p>Strategy registry for stochastic models. The default <code>fOU</code> key
resolves to the Euler-Maruyama discretization; consumers who want
the exact Riemann-Liouville variant look up <code>fOU-exact</code>. Same
convention for <code>mPRE</code> / <code>mPRE-exact</code>.</p>
</dd>
<dt><a href="#forecasterRegistry">forecasterRegistry</a> : <code><a href="#Forecaster">Registry.&lt;Forecaster&gt;</a></code></dt>
<dd><p>Strategy registry for forecasters.</p>
</dd>
<dt><a href="#optimizerRegistry">optimizerRegistry</a> : <code><a href="#Optimizer">Registry.&lt;Optimizer&gt;</a></code></dt>
<dd><p>Global optimizer registry.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#parseCsv">parseCsv(csv, opts)</a> ⇒ <code>Array.&lt;Object&gt;</code></dt>
<dd><p>Parses a CSV string into an array of plain objects.</p>
<p>Expected input shape:</p>
<ul>
<li>The first non-empty line is the header row.</li>
<li>Each subsequent line is a record with the same column count as the
header.</li>
<li>Fields can be optionally wrapped in double quotes; quotes may embed
commas but not other escapes.</li>
</ul>
<p>Type coercion:</p>
<ul>
<li><code>opts.dateField</code> (default <code>&quot;date&quot;</code>) is parsed via <code>new Date(...)</code>.</li>
<li>Any field listed in <code>opts.numericFields</code> is parsed via <code>parseFloat</code>.</li>
<li>All other fields are kept as trimmed strings.</li>
</ul>
<p>Error handling:</p>
<ul>
<li>Empty input returns <code>[]</code>.</li>
<li>Mismatched column counts throw with a descriptive message.</li>
<li>Non-numeric values in declared numeric columns throw.</li>
</ul>
</dd>
<dt><a href="#splitCSVLine">splitCSVLine(line)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Splits a single CSV line respecting double-quoted regions.</p>
<p>States:</p>
<ul>
<li>Outside quotes: a comma terminates the current field.</li>
<li>Inside quotes: a quote toggles back to &quot;outside&quot;, all other chars are
kept verbatim.</li>
</ul>
</dd>
<dt><a href="#extractSeries">extractSeries(rows, field, opts)</a> ⇒ <code>Array.&lt;{date: Date, value: number}&gt;</code></dt>
<dd><p>Extracts a <code>{date, value}</code> series from a parsed CSV array.</p>
<p>Rows that are missing <code>field</code> are skipped; the resulting series is
optionally sorted by <code>dateField</code> when the caller asks. Sorting uses
the standard JS <code>Date</code> arithmetic, so the dates must be real <code>Date</code>
instances.</p>
</dd>
<dt><a href="#parseJson">parseJson(json)</a> ⇒ <code>Array.&lt;Object&gt;</code></dt>
<dd><p>Parses a JSON string that must encode an array of objects.</p>
<p>The function deliberately refuses non-array JSON to keep the loader
simple. Empty or whitespace-only input returns <code>[]</code>.</p>
</dd>
<dt><a href="#validateNoGaps">validateNoGaps(series, maxGapMs)</a> ⇒ <code>Object</code></dt>
<dd><p>Validates that a time series does not contain temporal gaps larger
than <code>maxGapMs</code>.</p>
<p>Returns the maximum observed gap, the full list of pairwise gap
lengths, and a <code>valid</code> flag for the threshold check. Series with
fewer than two points are deemed valid by definition.</p>
</dd>
<dt><a href="#downsampleSeries">downsampleSeries(series, intervalMs)</a> ⇒ <code>Array.&lt;{date: Date, value: number}&gt;</code></dt>
<dd><p>Downsamples a time series by averaging values that fall into fixed
<code>intervalMs</code>-wide buckets.</p>
<p>The bucket index is computed as
    <code>floor(date.getTime() / intervalMs)</code>,
so all buckets share the same left edge (<code>0</code>, <code>intervalMs</code>,
<code>2 * intervalMs</code>, ...). The output is sorted by date and every
returned point carries the <em>bucket start</em> (not the average timestamp)
as its <code>date</code> value.</p>
</dd>
<dt><a href="#preaverageReturns">preaverageReturns(prices, [windowSize])</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Preaveraging of log-returns.</p>
<p>Implementation of the Jacod et al. (2009) preaveraging estimator
(simplified single-bar variant):</p>
<ol>
<li>Compute log-returns <code>r_t = log(P_t / P_{t-1})</code>.</li>
<li>For each <code>i</code>, average the <code>windowSize</code> consecutive returns ending at
<code>i</code> (<code>g_avg[i] = mean(r_{i - windowSize + 1}, ..., r_i)</code>).</li>
<li>The &quot;preaveraged return&quot; is the first-difference sequence
<code>g_avg[i] - g_avg[i - 1]</code>. This cancellation attenuates
microstructure noise by <code>1/sqrt(windowSize)</code> while preserving the
drift and diffusion up to <code>O(1 / windowSize)</code>.</li>
</ol>
<p>Note: the result has length <code>prices.length - windowSize - 1</code>; for
very short series the function throws rather than returning a few
noisy points.</p>
</dd>
<dt><a href="#computeRealizedKernel">computeRealizedKernel(returns, [kernelType], [bandwidth])</a> ⇒ <code>number</code></dt>
<dd><p>Realized-kernel variance estimator with pluggable kernels.</p>
<p>Given <code>n</code> returns, the estimator forms the autocorrelation sequence</p>
<pre><code>gamma_k = sum_{i=k+1}^{n} r_i * r_{i - k},  k = 0..h
</code></pre>
<p>and combines them through a weighted sum</p>
<pre><code>RV_K = gamma_0 + 2 * sum_{k=1..h} w_k * gamma_k
</code></pre>
<p>with weights <code>w_k</code> provided by the chosen kernel. The default
<code>bandwidth</code> is <code>floor(n^0.6)</code>, a rule-of-thumb that matches the
optimal scaling under i.i.d. microstructure noise.</p>
<p>Kernels shipped:</p>
<ul>
<li><code>bartlett</code>: <code>w_k = 1 - k / h</code> (default).</li>
<li><code>parzen</code>: the standard piecewise-cubic Parzen kernel.</li>
<li><code>tukey-hanning</code>: <code>0.5 (1 + cos(pi k / h))</code>.</li>
</ul>
<p>Any unknown kernel name falls back to Bartlett.</p>
</dd>
<dt><a href="#kernelWeight">kernelWeight(type, k, h)</a> ⇒ <code>number</code></dt>
<dd><p>Kernel weight function used by <a href="realizedKernel">realizedKernel</a>.</p>
</dd>
<dt><a href="#debiasLogVolatility">debiasLogVolatility(rawHEstimates, sigmaObs, sigmaLatent)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Heuristic de-biasing of log-volatility H estimates.</p>
<p>Microstructure noise inflates the variance of the log-volatility proxy
relative to the latent signal, which in turn attenuates the
observed roughness. This routine adds a small correction</p>
<pre><code>h_debias = h + 0.01 * log(sigmaObs / sigmaLatent)
</code></pre>
<p>and clamps the result to <code>[0.01, 0.99]</code>. It is intentionally
conservative — the user is expected to validate the calibration
against a trust sample before relying on it for production.</p>
</dd>
<dt><a href="#computeRealizedVariance">computeRealizedVariance(prices, [interval])</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Computes per-bucket realized variance from a price series.</p>
<p>The realized variance is the sum of squared log-returns within each
non-overlapping bucket of <code>interval</code> observations:</p>
<pre><code>RV_k = sum_{i in bucket k} (log P_i - log P_{i-1})^2
</code></pre>
<p>With <code>interval = 1</code> the function emits one RV per log-return
directly, which is the canonical &quot;5-minute RV&quot; form when prices are
already sampled at 5-minute intervals.</p>
</dd>
<dt><a href="#computeRealizedVarianceParkinson">computeRealizedVarianceParkinson(bars)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Parkinson (1980) high-low RV estimator from OHLC bars.</p>
<p>For each bar the within-period variance is approximated by</p>
<pre><code>sigma^2 ~= (log(H/L))^2 / (4 * ln 2)
</code></pre>
<p>which is <code>1/(4 ln 2) ~ 0.36</code> of the log-range-squared. Parkinson is
strictly less efficient than tick-based RV but only requires four
numbers per bar.</p>
</dd>
<dt><a href="#aggregateDailyRealizedVariance">aggregateDailyRealizedVariance(intradayRVs)</a> ⇒ <code>number</code></dt>
<dd><p>Aggregates intraday (5-minute) realized variances into a single daily
value via plain summation.</p>
<p>This is the standard &quot;sum of squared returns&quot; daily RV used in
financial econometrics. It assumes the input is already free of
overnight gaps.</p>
</dd>
<dt><a href="#applyLogTransform">applyLogTransform(rv)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Maps realized variance to the log-volatility series consumed by
hurstify.</p>
<p>The transformation is</p>
<pre><code>X_t = 0.5 * log(RV_t)
</code></pre>
<p>i.e. <code>log(sqrt(RV))</code>. This converts multiplicative variance dynamics
into a roughly additive (and therefore more stationary) signal, on
top of which the self-similarity property exploited by the RK-SAVR algorithm is
expressed.</p>
</dd>
<dt><a href="#centerSeries">centerSeries(series)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Subtracts the arithmetic mean from every element.</p>
<p>Useful as a final step in the preprocessing pipeline when the user
wants the series to mean-zero (which can stabilize variance-reducing
permutations inside <code>Hurstify</code>).</p>
</dd>
<dt><a href="#standardizeSeries">standardizeSeries(series)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Standardizes a time series to zero mean and unit variance.</p>
<p>Divides each centered value by the population standard deviation.
A constant series has zero variance and triggers an explicit error
rather than silently producing <code>NaN</code>s.</p>
</dd>
<dt><a href="#applyPreprocessingPipeline">applyPreprocessingPipeline(prices, opts)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Bundled preprocessing pipeline: <code>prices -&gt; RV -&gt; log-vol -&gt; (optional) centering</code>.</p>
<p>Equivalent to running <a href="computeRV">computeRV</a> + <a href="logTransform">logTransform</a> +
(optionally) <a href="#centerSeries">centerSeries</a>, but more compact for callers who
want the canonical transformation.</p>
</dd>
<dt><a href="#splitTrainTest">splitTrainTest(series, [trainRatio])</a> ⇒ <code>Object</code></dt>
<dd><p>Splits a series into contiguous training and test arrays.</p>
<p>The split point is <code>floor(series.length * trainRatio)</code> so the training
set is the leftmost prefix of the series; this preserves temporal
ordering, which is what hurstify forecasters and validation scripts
typically need.</p>
</dd>
<dt><a href="#createSlidingWindows">createSlidingWindows(series, windowSize, [step])</a> ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code></dt>
<dd><p>Builds overlapping windows from a single time series.</p>
<p>The i-th window is <code>series.slice(i, i + windowSize)</code> for <code>i = 0, step, 2*step, ...</code> until no full window fits. Used by offline batch
evaluation pipelines that want to score the estimator on every
available segment of the series.</p>
</dd>
<dt><a href="#generateVixLogVolatility">generateVixLogVolatility(nDays, h, opts)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Synthetic VIX-style daily log-volatility.</p>
<p>Generates an fBM with the requested <code>h</code> and maps it to a log-volatility
level around <code>2.0</code> (i.e. <code>sqrt(RV) ~ 20%</code>) by adding a small drift
term and Gaussian observation noise:</p>
<pre><code>X_t = 2.0 + drift * (fbm[t] / sqrt(n)) + 0.5 * fbm[t] + noise
</code></pre>
<p>Default tuning matches the empirical VIX roughness (<code>h ~ 0.1</code>) and
annualized log-vol mean.</p>
</dd>
<dt><a href="#generateSpxLogVolatility">generateSpxLogVolatility(nDays, h, opts)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Synthetic S&amp;P 500 realized-volatility style daily log-volatility.</p>
<p>Same construction as <a href="generateVIXLogVol">generateVIXLogVol</a> but with a smoother
default Hurst (<code>h = 0.14</code>), a smaller drift, and a less volatile
observation-noise level. Empirically these choices match the rough
regime typically reported for SPX RV.</p>
</dd>
<dt><a href="#generateIntradayPrices">generateIntradayPrices([nIntraday], [nDays], h, opts)</a> ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code></dt>
<dd><p>Generates synthetic intraday 5-minute prices useful for testing
realized-variance pipelines.</p>
<p>For every (re-)sampled day the generator draws an fBM with the
requested <code>h</code>, exponentiates it into a volatility factor, and steps a
log-return process</p>
<pre><code>S_{i+1} = S_i * exp(drift + vol_i * z_i * sqrt(dt))
</code></pre>
<p>with <code>drift</code> set to the per-5-minute-bar annualized drift. The result
is a <code>nDays</code> x <code>nIntraday</code> array of prices suitable for feeding into
<a href="computeRV">computeRV</a>.</p>
</dd>
<dt><a href="#seriesToCsv">seriesToCsv(series, [dateHeader], [valueHeader])</a> ⇒ <code>string</code></dt>
<dd><p>Serializes a <code>{date, value}</code> series as a CSV string.</p>
<p>Dates that are <code>Date</code> instances are formatted as their ISO yyyy-mm-dd
prefix; everything else is stringified verbatim. Empty series
produces a header-only CSV.</p>
</dd>
<dt><a href="#buildScaleProfile">buildScaleProfile(sortedSamples, scales, H)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Builds a flat &quot;profile&quot; of all pairwise KS distances at a fixed <code>H</code>.</p>
<p>Given <code>K</code> sorted samples, the profile has <code>K * (K - 1) / 2</code> entries
corresponding to every unordered scale pair. Useful for diagnostics.</p>
</dd>
<dt><a href="#getAsymptoticVariance">getAsymptoticVariance(scaleA1, scaleA2, n, m)</a> ⇒ <code>number</code></dt>
<dd><p>Asymptotic variance of the Hurstify estimator.</p>
<p>Implements</p>
<pre><code>Var(H_hat) = (2 * pi * e) / (ln(a2/a1))^2 * (1/sqrt(n) + 1/sqrt(m))^2.
</code></pre>
<p>When <code>a1 == a2</code> (log ratio zero) the variance is degenerate and the
function returns <code>Infinity</code> rather than dividing by zero; callers that
intend to compute a SE/CI should reject equal scales up-front.</p>
</dd>
<dt><a href="#getStandardError">getStandardError(scaleA1, scaleA2, n, m)</a> ⇒ <code>number</code></dt>
<dd><p>Asymptotic standard error: square root of the asymptotic variance.</p>
<p>Thin convenience wrapper. The standard error has units of &quot;Hurst&quot; and
can be read against the <code>hMin</code>/<code>hMax</code> bounds the estimator was
configured with.</p>
</dd>
<dt><a href="#getConfidenceInterval">getConfidenceInterval(hEstimate, scaleA1, scaleA2, n, m, alpha)</a> ⇒ <code>Object</code></dt>
<dd><p>Two-sided asymptotic confidence interval for <code>H</code>.</p>
<p>Combines the asymptotic standard error with the standard-normal
critical value <code>z_{1 - alpha/2}</code> (computed by the internal
<code>normalQuantile</code>) to produce</p>
<pre><code>CI = H_hat +/- z * SE.
</code></pre>
<p>Note: this CI is <strong>not</strong> clipped to <code>[0, 1]</code>. For practical reporting
users may want to clamp to <code>[hMin, hMax]</code>.</p>
</dd>
<dt><a href="#runKalmanFilter">runKalmanFilter(observations, opts)</a> ⇒ <code>Object</code></dt>
<dd><p>One-dimensional Kalman filter for H(t) smoothing.</p>
<p>State: <code>x_t = H_t</code>. Transition: <code>H_t = H_{t-1} + w_t</code>, <code>w_t ~ N(0, q)</code>.
Observation: <code>z_t = H_t + v_t</code>, <code>v_t ~ N(0, r)</code>.</p>
<p>The filter is seeded with the first observation (<code>x_0 = z_0</code>) and a
unit prior covariance. Each subsequent step performs:</p>
<ol>
<li><strong>Predict:</strong> <code>xPred = x</code>, <code>pPred = p + q</code>.</li>
<li><strong>Update:</strong> <code>K = pPred / (pPred + r)</code>, <code>x = xPred + K * (z - xPred)</code>,
<code>p = (1 - K) * pPred</code>.</li>
</ol>
<p>The result captures both the one-step-ahead predictions (before
incorporating the observation) and the filtered states (after).</p>
</dd>
<dt><a href="#normalQuantile">normalQuantile(p)</a> ⇒ <code>number</code></dt>
<dd><p>Inverse standard normal CDF (quantile function).</p>
<p>Implementation: piecewise rational approximation due to Beasley &amp;
Springer (1977) / Acklam (2010). The central region
<code>p in [pLow, 1 - pLow]</code> uses a degree-5/4 rational function of
<code>r2 = (p - 0.5)^2</code>; the tails use a degree-3/3 rational function of
<code>q = sqrt(-2 ln p)</code> (or <code>q = sqrt(-2 ln (1 - p))</code> for the upper tail).</p>
<ul>
<li><code>p &lt;= 0</code> returns <code>-Infinity</code>.</li>
<li><code>p &gt;= 1</code> returns <code>Infinity</code>.</li>
<li><code>p === 0.5</code> returns exactly <code>0</code>.</li>
</ul>
<p>Numerical accuracy is <code>~1e-9</code> across the open interval <code>(0, 1)</code>.</p>
</dd>
<dt><a href="#normalCdf">normalCdf(x)</a> ⇒ <code>number</code></dt>
<dd><p>Standard normal CDF via the Abramowitz &amp; Stegun rational
approximation (7.1.26).</p>
<p>Numerical accuracy is <code>~7.5e-8</code> over the whole real line. This is the
inverse-of-complement of <a href="#normalQuantile">normalQuantile</a> and is shared by every
inference routine that needs a closed-form normal tail probability
(currently the constancy likelihood-ratio test in
<code>inference/filtering.js</code>).</p>
</dd>
<dt><a href="#setLogLevel">setLogLevel(level)</a></dt>
<dd><p>Sets the current log level.</p>
</dd>
<dt><a href="#getLogLevel">getLogLevel()</a> ⇒ <code>number</code></dt>
<dd><p>Reads the current log level.</p>
</dd>
<dt><a href="#log">log(level, label, args)</a></dt>
<dd><p>Internal dispatcher: drops the message if it falls below the configured
cut-off, otherwise forwards to the appropriate <code>console.*</code> channel.</p>
</dd>
<dt><a href="#debug">debug(...args)</a></dt>
<dd><p>Emits a message at <code>DEBUG</code> level.</p>
</dd>
<dt><a href="#info">info(...args)</a></dt>
<dd><p>Emits a message at <code>INFO</code> level.</p>
</dd>
<dt><a href="#warn">warn(...args)</a></dt>
<dd><p>Emits a message at <code>WARN</code> level (visible by default).</p>
</dd>
<dt><a href="#error">error(...args)</a></dt>
<dd><p>Emits a message at <code>ERROR</code> level (visible by default).</p>
</dd>
<dt><a href="#getModel">getModel(name)</a> ⇒ <code><a href="#StochasticModel">StochasticModel</a></code> | <code>undefined</code></dt>
<dd><p>Retrieves a registered model strategy by name.</p>
</dd>
<dt><a href="#registerModel">registerModel(name, factory)</a></dt>
<dd><p>Registers a new model strategy under the supplied name.</p>
</dd>
<dt><a href="#listModels">listModels()</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Lists every registered model strategy identifier.</p>
</dd>
<dt><a href="#getForecaster">getForecaster(name)</a> ⇒ <code><a href="#Forecaster">Forecaster</a></code> | <code>undefined</code></dt>
<dd><p>Retrieves a registered forecaster by name.</p>
</dd>
<dt><a href="#registerForecaster">registerForecaster(name, factory)</a></dt>
<dd><p>Registers a new forecaster strategy under the supplied name.</p>
</dd>
<dt><a href="#listForecasters">listForecasters()</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Lists every registered forecaster identifier.</p>
</dd>
<dt><a href="#runAdaptiveGridSearch">runAdaptiveGridSearch(f, min, max, opts)</a> ⇒ <code>Object</code></dt>
<dd><p>Adaptive grid search with Brent refinement for 1D minimization.</p>
<p>Algorithm:</p>
<ol>
<li>Initialize with the midpoint of <code>[min, max]</code>.</li>
<li>Repeat <code>refineIters</code> times:<ul>
<li>Sample <code>gridSize</code> evenly spaced points across <code>[a, b]</code>.</li>
<li>Track the best point.</li>
<li>Shrink <code>[a, b]</code> to <code>[best - 2*step, best + 2*step]</code> clamped to the
original interval.</li>
<li>Stop early if <code>[a, b]</code> shrinks below <code>tol</code>.</li>
</ul>
</li>
<li>Polish the local minimum with Brent&#39;s method using <code>bestX</code> as the
initial guess.</li>
</ol>
<p>The Brent refinement makes the function value at the returned <code>x</code>
accurate to machine epsilon in nearly all cases.</p>
</dd>
<dt><a href="#runBrent">runBrent(f, ax, bx, cx, tol)</a> ⇒ <code>Object</code></dt>
<dd><p>Minimizes <code>f(x)</code> on the interval <code>[ax, cx]</code> using Brent&#39;s method.</p>
<p>The algorithm tracks the best point <code>x</code>, the second-best <code>w</code>, and the
third-best <code>v</code>; it uses a parabolic fit whenever the parabolic step is
safe, otherwise falls back to a golden-section step. Convergence is
declared when <code>|x - midpoint| &lt;= 2 * tol * |x| + EPS</code> or when the
iteration cap of 100 is reached.</p>
<p>Invariants:</p>
<ul>
<li>The bracket <code>[a, b]</code> always contains the minimum.</li>
<li><code>f(x) &lt;= f(w) &lt;= f(v)</code> at every iteration.</li>
</ul>
</dd>
<dt><a href="#runDifferentialEvolution">runDifferentialEvolution(f, x0, opts)</a> ⇒ <code>Object</code></dt>
<dd><p>Differential-evolution minimization over an arbitrary-dimensional
space.</p>
<p>The initial population is drawn uniformly inside <code>[lb, ub]</code>. Each
member produces one trial per generation; the trial survives to the
next generation only when its objective is strictly better.</p>
</dd>
<dt><a href="#runNelderMead">runNelderMead(f, x0, opts)</a> ⇒ <code>Object</code></dt>
<dd><p>Nelder-Mead minimization over a multidimensional space.</p>
<p>Builds an initial simplex by perturbing each axis of <code>x0</code> by <code>1e-4</code>
and then iterates the standard reflection / expansion / contraction /
shrink move until either the spread of function values is below <code>tol</code>
or <code>maxIter</code> iterations have been performed.</p>
</dd>
<dt><a href="#runSimulatedAnnealing">runSimulatedAnnealing(f, x0, opts)</a> ⇒ <code>Object</code></dt>
<dd><p>Simulated-annealing minimization over an arbitrary-dimensional space.</p>
<p>The neighbor for each iteration is generated by perturbing every
coordinate by a uniform offset in <code>[-stepSize, stepSize]</code>. The
acceptance temperature decays geometrically: <code>temp *= coolingRate</code>. The
loop terminates once either <code>maxIter</code> iterations are performed or the
temperature drops below <code>finalTemp</code>.</p>
</dd>
<dt><a href="#mulberry32">mulberry32(seed)</a> ⇒ <code>function</code></dt>
<dd><p>Constructs a mulberry32 generator with the given 32-bit seed.</p>
<p>The algorithm packs the state into a single unsigned 32-bit integer
<code>a</code>. Each call applies two well-known integer mixing steps
(<code>Math.imul</code> &amp; bitwise shift) and returns the result divided by
<code>2^32</code> so the output is in <code>[0, 1)</code>.</p>
</dd>
<dt><a href="#setRandomSeed">setRandomSeed(seed)</a></dt>
<dd><p>Sets a global seed for reproducible simulations.</p>
<p>Passing <code>null</code> or <code>undefined</code> clears the seed and reverts to
<code>Math.random()</code>. Calling <code>setRandomSeed</code> twice restarts the
deterministic sequence from scratch.</p>
</dd>
<dt><a href="#resetRandomSeed">resetRandomSeed()</a></dt>
<dd><p>Resets the PRNG to use <code>Math.random()</code> for all subsequent draws.</p>
<p>Equivalent to <code>setRandomSeed(null)</code>. Use this at the end of a
deterministic experiment to restore nondeterministic behavior.</p>
</dd>
<dt><a href="#nextRandom">nextRandom()</a> ⇒ <code>number</code></dt>
<dd><p>Returns a uniform random number in <code>[0, 1)</code>.</p>
<p>Uses the seeded generator when one has been installed via
<code>setRandomSeed</code>, otherwise falls through to <code>Math.random()</code>. Because
this dispatcher is called from every stochastic primitive in the
library, the <em>entire</em> computation tree is reproducible from a single
seed.</p>
</dd>
<dt><a href="#computeKsDistance">computeKsDistance(sample1, sample2, isSorted)</a> ⇒ <code>number</code></dt>
<dd><p>Computes the two-sample Kolmogorov-Smirnov distance.</p>
<p>Algorithm: a linear merged-pointer walk over the sorted order statistics.
As we walk through the sorted union we maintain the empirical CDF values
<code>F_n(x) = (i + 1) / n</code> and <code>G_m(x) = j / m</code> at the current position and
record the absolute difference. Sorting first dominates the cost; the
walk itself is <code>O(n + m)</code> where <code>n = sample1.length</code> and
<code>m = sample2.length</code>.</p>
<p>Input validation:</p>
<ul>
<li>Both samples must be non-empty arrays or <code>Float64Array</code>s.</li>
<li>All values must be finite (no <code>NaN</code>, <code>+Infinity</code>, <code>-Infinity</code>).</li>
</ul>
<p>Ties: when values are equal the walk advances both pointers and uses
<code>(i + 1) / n</code> vs. <code>(j + 1) / m</code> for the distance — this matches the
standard two-sided statistic.</p>
</dd>
<dt><a href="#computeKsDistanceRescaled">computeKsDistanceRescaled(sortedA, sortedB, factorA, factorB)</a> ⇒ <code>number</code></dt>
<dd><p>Kolmogorov-Smirnov distance for <strong>already sorted</strong> samples that need
rescaling.</p>
<p>Equivalent to <code>ksDistance(a, b, true)</code> but applies the rescaling factors
during the merged-pointer walk so no auxiliary allocation is needed.
Multiplication by a positive scalar is order-preserving, so the
pre-sorting of the inputs is unaffected by the choice of <code>factorA</code> and
<code>factorB</code>.</p>
<p>This is the hot path of the Hurstify estimator&#39;s inner loop:
<code>O(n + m)</code> per evaluation, no allocations beyond the locals below.</p>
</dd>
<dt><a href="#shuffleArray">shuffleArray(array)</a> ⇒ <code>Array.&lt;*&gt;</code></dt>
<dd><p>Unbiased Fisher-Yates shuffle.</p>
<p>Returns a new array; the input is never mutated. Uses the seeded PRNG
exposed by <code>prng.js</code>, so the result is reproducible when a seed is set.</p>
<p>Complexity: <code>O(n)</code> time, <code>O(n)</code> extra memory.</p>
</dd>
<dt><a href="#permuteBlocks">permuteBlocks(data, blockSize, randomPhase)</a> ⇒ <code>Array.&lt;*&gt;</code></dt>
<dd><p>Block random permutation for decorrelating serial dependence.</p>
<p>Conceptually this is the paper&#39;s &quot;preserves marginals, kills short-range
autocorrelation&quot; operation:</p>
<ol>
<li>(Optional) shift the starting index by a uniform <code>[-0, blockSize)</code>
offset so two calls with the same seed still produce different
alignments.</li>
<li>Slice the resulting series into blocks of length <code>blockSize</code> (the
first block may be shorter than <code>blockSize</code> when a phase offset was
applied).</li>
<li>Apply a Fisher-Yates shuffle to the block list.</li>
<li>Concatenate the shuffled blocks back into a single sequence.</li>
</ol>
<p>Picking <code>blockSize</code> is the user&#39;s responsibility: it should be larger than
the dominant autocorrelation length in <code>data</code>. Too small and serial
dependence survives; too large and the number of blocks — and therefore
the effective randomization — shrinks.</p>
</dd>
<dt><a href="#getRandomSample">getRandomSample(array, n)</a> ⇒ <code>Array.&lt;*&gt;</code></dt>
<dd><p>Floyd&#39;s Algorithm R reservoir sampler.</p>
<p>Streams over the input producing a uniformly random sample of size <code>n</code>
<strong>without replacement</strong>. Equivalent to <code>shuffle(array).slice(0, n)</code> but
uses only <code>O(n)</code> auxiliary memory and a single pass through <code>array</code>,
which matters when sampling from very large arrays (e.g. millions of
increments).</p>
<p>Edge cases:</p>
<ul>
<li><code>n &gt;= array.length</code>: returns a shuffled full copy of <code>array</code>.</li>
<li><code>n &lt;= 0</code>: returns an empty array.</li>
</ul>
</dd>
<dt><a href="#nextGaussian">nextGaussian()</a> ⇒ <code>number</code></dt>
<dd><p>Draws a single standard normal via Box-Muller.</p>
<p>The polar variant is implemented by guarding against degenerate
<code>u === 0</code> draws from <code>nextRandom()</code>. One Box-Muller pair yields two
independent standard normals; this routine keeps the cosine component
and discards the sine. Use <a href="#generateCorrelatedGaussian">generateCorrelatedGaussian</a> if you
need both halves, or call <code>nextGaussian</code> twice with distinct
<code>nextRandom()</code> outputs.</p>
</dd>
<dt><a href="#generateGaussianBatch">generateGaussianBatch(n)</a> ⇒ <code>Float64Array</code></dt>
<dd><p>Pre-allocates a <code>Float64Array</code> of standard normals.</p>
<p>Useful when an inner loop needs a contiguous buffer of normals; the
allocation is amortized across a single batch draw, whereas repeated
<a href="#nextGaussian">nextGaussian</a> calls would each allocate internally.</p>
</dd>
<dt><a href="#generateCorrelatedGaussian">generateCorrelatedGaussian(n, rho)</a> ⇒ <code>Array.&lt;Float64Array&gt;</code></dt>
<dd><p>Generates two correlated standard-normal streams via Cholesky.</p>
<p>Mathematically the model is <code>(Z1, Z2)</code> with unit marginals and
<code>Corr(Z1, Z2) = rho</code>. Implementation: draw an i.i.d. Box-Muller pair
<code>(z1, z2)</code>; set <code>Z1 = z1</code>; set <code>Z2 = rho * z1 + sqrt(1 - rho^2) * z2</code>.
Both <code>Z1</code> and <code>Z2</code> have unit variance and exactly correlation <code>rho</code>.</p>
<p>Important: <code>rho</code> must be <strong>strictly</strong> in <code>(-1, 1)</code>; the implementation
silently clamps <code>1 - rho^2</code> to zero via <code>Math.max(0, ...)</code> so the
endpoints collapse to the trivial deterministic case.</p>
</dd>
<dt><a href="#generateFractionalNoise">generateFractionalNoise(n, H)</a> ⇒ <code>Float64Array</code></dt>
<dd><p>Fractional Gaussian Noise via Hosking&#39;s method.</p>
<p>Hosking&#39;s method is an exact <code>O(n^2)</code> Cholesky-style recursion that
generates samples from the autocovariance
    <code>gamma(k) = 0.5 (|k+1|^{2H} - 2|k|^{2H} + |k-1|^{2H})</code>.</p>
<p>It uses <code>O(n)</code> recursion updates to compute the conditional mean and
variance <code>(phi, v)</code> incrementally, so the per-step cost is <code>O(k)</code> and
the total <code>O(n^2)</code>. This is fine for the scales used in the paper
(a few hundred to a few thousand samples) but dominates for <code>n &gt;&gt; 1e4</code>.</p>
<p>Assumptions:</p>
<ul>
<li><code>n &gt; 0</code> and <code>H in (0, 1)</code>.</li>
<li>The result is mean-zero (the recursion conditions on <code>x_0 ~ N(0, 1)</code>).</li>
</ul>
</dd>
<dt><a href="#generateFractionalBrownianMotion">generateFractionalBrownianMotion(n, H)</a> ⇒ <code>Float64Array</code></dt>
<dd><p>Fractional Brownian Motion by cumulative summation of fGN.</p>
<p>The implementation delegates the heavy lifting to <a href="#generateFractionalNoise">generateFractionalNoise</a>
and then performs a single <code>O(n)</code> cumulative-sum pass. The first sample
is fixed at 0 (the standard convention for <code>fBM(0) = 0</code>), so paths
always start at the origin.</p>
<p>For non-zero means, simply add a constant afterwards — <code>fGn</code> is
mean-zero by construction.</p>
</dd>
<dt><a href="#computeFractionalKernel">computeFractionalKernel(H, nSteps, dt)</a> ⇒ <code>Float64Array</code></dt>
<dd><p>Precomputes the Riemann-Liouville fractional kernel used by the
rough-volatility simulators.</p>
<p>Mathematically <code>K(t) = sqrt(2 H) * t^{H - 0.5}</code> for <code>t &gt; 0</code>. The result is
a length-<code>nSteps</code> array where entry <code>i</code> corresponds to <code>t = (i + 1) * dt</code>.</p>
<p>Reusing a precomputed kernel for every path avoids the O(n^2) cost of
re-evaluating the power function per integration step.</p>
</dd>
<dt><a href="#computeFractionalIntegral">computeFractionalIntegral(dW, kernel, t)</a> ⇒ <code>number</code></dt>
<dd><p>Computes a single time-step of the Riemann-Liouville fractional integral.</p>
<p>Given precomputed Brownian increments <code>dW</code> and a kernel from
<a href="#computeFractionalKernel">computeFractionalKernel</a>, returns
    <code>I_t = sum_{j=0}^{t-1} K(t - j) * dW_j</code>.</p>
<p>Used inside the rBergomi path generator and the exact <code>fOU</code> driver.</p>
<p>Complexity: <code>O(t)</code> per call, so building a full path is <code>O(n^2)</code>. This
is acceptable for paths up to a few hundred steps; for long simulations
switch to a circulant-embedding FFT approximation (not implemented here).</p>
</dd>
<dt><a href="#xavierInit">xavierInit(rows, cols)</a> ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code></dt>
<dd><p>Xavier (Glorot-uniform) weight initialization.</p>
<p>Produces a <code>rows x cols</code> matrix where each entry is sampled uniformly
in <code>[-scale, scale]</code> with <code>scale = sqrt(2 / (rows + cols))</code>. This is the
standard initializer for tanh/sigmoid-activated layers (Glorot &amp;
Bengio, 2010).</p>
</dd>
<dt><a href="#getBinomialCoeffs">getBinomialCoeffs(d, lag)</a> ⇒ <code>Float64Array</code></dt>
<dd><p>Returns the binomial coefficient sequence <code>[C(d, 0), ..., C(d, lag)]</code>.</p>
<p>Uses a tiny FIFO cache keyed by <code>${d}:${lag}</code> so that identical
lookups within a rolling ARFIMA run are <code>O(1)</code>. When the cache is
full the oldest entry is evicted.</p>
</dd>
<dt><a href="#fractionalDifference">fractionalDifference(data, d, [lag])</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Computes the (truncated) fractional difference of a series for a given
<code>d</code> and lag cap. The truncation to <code>lag</code> keeps the per-step cost
<code>O(lag)</code> rather than <code>O(t)</code>, which is essential for long-history
forecasting.</p>
</dd>
<dt><a href="#ksCriticalValue">ksCriticalValue(n, m, alpha)</a> ⇒ <code>number</code></dt>
<dd><p>Two-sample Kolmogorov–Smirnov asymptotic critical value.</p>
<pre><code>D_alpha = sqrt(-0.5 * ln(alpha / 2)) * sqrt((n + m) / (n * m))
</code></pre>
</dd>
<dt><a href="#ksPvalue">ksPvalue(D, n, m)</a> ⇒ <code>number</code></dt>
<dd><p>Approximate two-sample KS p-value via the asymptotic Kolmogorov
distribution.</p>
<pre><code>Q(lambda) ~ 2 * sum_{j=1..3} (-1)^{j-1} * exp(-2 j^2 lambda^2)
</code></pre>
<p>with the standard <code>lambda</code> correction.</p>
</dd>
<dt><a href="#kalmanLogLikelihood">kalmanLogLikelihood(observations, q, r)</a> ⇒ <code>number</code></dt>
<dd><p>Log-likelihood of the observations under a 1D Kalman filter.</p>
</dd>
<dt><a href="#detectCusumBreakpoints">detectCusumBreakpoints(hHistory, windowSize, threshold)</a> ⇒ <code>Array.&lt;{index: number, H_before: number, H_after: number}&gt;</code></dt>
<dd><p>Detects breakpoints in a series of H estimates via a sliding-window
CUSUM.</p>
</dd>
<dt><a href="#chooseKsObjective">chooseKsObjective([scales], [weights])</a> ⇒ <code><a href="#KsObjective">KsObjective</a></code></dt>
<dd><p>Selects the right <code>KsObjective</code> for a configuration.</p>
</dd>
<dt><a href="#defaultSampler">defaultSampler([blockSize])</a> ⇒ <code><a href="#Sampler">Sampler</a></code></dt>
<dd><p>Convenience: selects the default sampler based on <code>blockSize</code>.</p>
<ul>
<li>When <code>blockSize</code> is a positive number a <code>BlockPermutationSampler</code>
is returned.</li>
<li>Otherwise a <code>ReservoirSampler</code> is returned.</li>
</ul>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#KsSignificanceResult">KsSignificanceResult</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#ConstancyResult">ConstancyResult</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#CusumBreakResult">CusumBreakResult</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#BootstrapCiResult">BootstrapCiResult</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#SimulationResult">SimulationResult</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#PriceResult">PriceResult</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="Optimizer"></a>

## Optimizer

Strategy base class. Subclasses implement `minimize` polymorphically.

**Kind**: global class  
<a name="Optimizer+minimize"></a>

### optimizer.minimize(_objective, _lower, _upper, _initial) ⇒ <code>number</code>

Minimizes the given objective on the closed interval `[lower, upper]`
starting from `initial`. Subclasses implement the algorithm-specific
search.

**Kind**: instance method of [<code>Optimizer</code>](#Optimizer)  
**Returns**: <code>number</code> - Argmin `h` inside `[_lower, _upper]`.

| Param      | Type                  | Description                              |
| ---------- | --------------------- | ---------------------------------------- |
| _objective | <code>function</code> | Scalar objective function.               |
| _lower     | <code>number</code>   | Lower bound of the search interval.      |
| _upper     | <code>number</code>   | Upper bound of the search interval.      |
| _initial   | <code>number</code>   | Initial guess inside `[_lower, _upper]`. |

<a name="Forecaster"></a>

## _Forecaster_

Abstract base class for H-series forecasters.

**Kind**: global abstract class

- _[Forecaster](#Forecaster)_
  - **[.predict(history)](#Forecaster+predict) ⇒ <code>number</code>**
  - _[.forecast(history)](#Forecaster+forecast) ⇒ <code>number</code>_

<a name="Forecaster+predict"></a>

### **forecaster.predict(history) ⇒ <code>number</code>**

Predicts the next `H` value from the supplied history.

**Kind**: instance abstract method of [<code>Forecaster</code>](#Forecaster)  
**Returns**: <code>number</code> - Predicted `H`.

| Param   | Type                              | Description                 |
| ------- | --------------------------------- | --------------------------- |
| history | <code>Array.&lt;number&gt;</code> | Time-ordered `H` estimates. |

<a name="Forecaster+forecast"></a>

### _forecaster.forecast(history) ⇒ <code>number</code>_

Alias for [predict](#Forecaster+predict).

**Kind**: instance method of [<code>Forecaster</code>](#Forecaster)  
**Returns**: <code>number</code> - Predicted `H`.

| Param   | Type                              | Description                 |
| ------- | --------------------------------- | --------------------------- |
| history | <code>Array.&lt;number&gt;</code> | Time-ordered `H` estimates. |

<a name="HypothesisTest"></a>

## _HypothesisTest_

**Kind**: global abstract class  
<a name="HypothesisTest+run"></a>

### **hypothesisTest.run(data, opts) ⇒ <code>Result</code>**

Runs the test on `data` with the supplied options.

**Kind**: instance abstract method of [<code>HypothesisTest</code>](#HypothesisTest)  
**Returns**: <code>Result</code> - Test result bundle.

| Param | Type                | Description                                |
| ----- | ------------------- | ------------------------------------------ |
| data  | <code>\*</code>     | Test input (depends on the concrete test). |
| opts  | <code>Object</code> | Test options.                              |

<a name="Kernel"></a>

## _Kernel_

Abstract base class for fractional-integration kernels.

**Kind**: global abstract class

- _[Kernel](#Kernel)_
  - **[.evaluate(t)](#Kernel+evaluate) ⇒ <code>number</code>**
  - _[.precompute(nSteps, dt)](#Kernel+precompute) ⇒ <code>Float64Array</code>_

<a name="Kernel+evaluate"></a>

### **kernel.evaluate(t) ⇒ <code>number</code>**

Evaluates the kernel at lag `t > 0`.

**Kind**: instance abstract method of [<code>Kernel</code>](#Kernel)  
**Returns**: <code>number</code> - Kernel weight at `t`.

| Param | Type                | Description                   |
| ----- | ------------------- | ----------------------------- |
| t     | <code>number</code> | Positive lag (units of `dt`). |

<a name="Kernel+precompute"></a>

### _kernel.precompute(nSteps, dt) ⇒ <code>Float64Array</code>_

Precomputes the kernel over `nSteps` time steps at stride `dt`.

**Kind**: instance method of [<code>Kernel</code>](#Kernel)  
**Returns**: <code>Float64Array</code> - Cached kernel values.

| Param  | Type                | Description              |
| ------ | ------------------- | ------------------------ |
| nSteps | <code>number</code> | Number of time steps.    |
| dt     | <code>number</code> | Per-step time increment. |

<a name="KsObjective"></a>

## _KsObjective_

Abstract base class for KS-distance objectives.

**Kind**: global abstract class  
<a name="KsObjective+evaluate"></a>

### **ksObjective.evaluate(sortedSamples, scales, H) ⇒ <code>number</code>**

Evaluates the objective at the trial `H`.

**Kind**: instance abstract method of [<code>KsObjective</code>](#KsObjective)  
**Returns**: <code>number</code> - Non-negative objective value.

| Param         | Type                                    | Description                                             |
| ------------- | --------------------------------------- | ------------------------------------------------------- |
| sortedSamples | <code>Array.&lt;Float64Array&gt;</code> | One pre-sorted sample per scale (each of equal length). |
| scales        | <code>Array.&lt;number&gt;</code>       | Scale values matching `sortedSamples`.                  |
| H             | <code>number</code>                     | Trial Hurst parameter.                                  |

<a name="MultiScaleKsObjective"></a>

## MultiScaleKsObjective

Multi-scale unweighted KS objective.

Returns the arithmetic mean of the pairwise KS distances over every
unordered pair `(i, j)` with `i < j`. Equivalent to the paper's
recommended extension to `K > 2` scales.

**Kind**: global class  
<a name="MultiScaleKsObjective+evaluate"></a>

### multiScaleKsObjective.evaluate()

**Kind**: instance method of [<code>MultiScaleKsObjective</code>](#MultiScaleKsObjective)  
<a name="StochasticModel"></a>

## _StochasticModel_

Abstract base class for stochastic-process simulators.

**Kind**: global abstract class

- _[StochasticModel](#StochasticModel)_
  - **[.simulate(opts)](#StochasticModel+simulate) ⇒ [<code>SimulationResult</code>](#SimulationResult)**
  - _[.price(sim, opts)](#StochasticModel+price) ⇒ [<code>PriceResult</code>](#PriceResult)_

<a name="StochasticModel+simulate"></a>

### **stochasticModel.simulate(opts) ⇒ [<code>SimulationResult</code>](#SimulationResult)**

Simulates `nPaths` paths of the underlying stochastic process.

**Kind**: instance abstract method of [<code>StochasticModel</code>](#StochasticModel)  
**Returns**: [<code>SimulationResult</code>](#SimulationResult) - Simulated paths + time grid.

| Param | Type                | Description             |
| ----- | ------------------- | ----------------------- |
| opts  | <code>Object</code> | Model-specific options. |

<a name="StochasticModel+price"></a>

### _stochasticModel.price(sim, opts) ⇒ [<code>PriceResult</code>](#PriceResult)_

Optionally drives a price SDE using the simulator's noise
realization. Default: throws — only models with a price SDE
implement this method.

**Kind**: instance method of [<code>StochasticModel</code>](#StochasticModel)  
**Returns**: [<code>PriceResult</code>](#PriceResult) - Simulated prices.

| Param | Type                                               | Description                     |
| ----- | -------------------------------------------------- | ------------------------------- |
| sim   | [<code>SimulationResult</code>](#SimulationResult) | Output of [simulate](simulate). |
| opts  | <code>Object</code>                                | Price-SDE options.              |

<a name="RoughBergomiModel"></a>

## RoughBergomiModel

Rough Bergomi model.

    dV_t / V_t = eta * dW^perp_t
    I_t = int_0^t sqrt(2H) (t - s)^{H - 0.5} dW^perp_s
    V_t = xi * exp(eta I_t - (eta^2 / 2) t^{2H})

**Kind**: global class  
<a name="RoughFsvModel"></a>

## RoughFsvModel

Rough Fractional Stochastic Volatility model.

    dV_t = theta (mu - V_t) dt + nu V_t^alpha dW^V_t + roughComp

**Kind**: global class  
<a name="FractionalOuModel"></a>

## _FractionalOuModel_

Abstract base class for the Fractional Ornstein-Uhlenbeck model.

    dX_t = theta (mu - X_t) dt + sigma dB^H_t

Concrete subclasses pick the discretization scheme:

- [EulerMaruyamaFractionalOuModel](#EulerMaruyamaFractionalOuModel) — default, cheap
- [ExactFractionalOuModel](#ExactFractionalOuModel) — Riemann-Liouville integral, accurate

**Kind**: global abstract class

- _[FractionalOuModel](#FractionalOuModel)_
  - _instance_
    - _[.vasicekPath(opts)](#FractionalOuModel+vasicekPath) ⇒ <code>Object</code>_
  - _static_
    - _[.parseOpts([opts])](#FractionalOuModel.parseOpts) ⇒ <code>Object</code>_
    - _[.buildTimes(nSteps, dt)](#FractionalOuModel.buildTimes) ⇒ <code>Array.&lt;number&gt;</code>_

<a name="FractionalOuModel+vasicekPath"></a>

### _fractionalOuModel.vasicekPath(opts) ⇒ <code>Object</code>_

Special-case fast path: exact Vasicek recursion when `H = 0.5`.

**Kind**: instance method of [<code>FractionalOuModel</code>](#FractionalOuModel)  
**Returns**: <code>Object</code> - Generated path
and matching time grid.

| Param | Type                | Description    |
| ----- | ------------------- | -------------- |
| opts  | <code>Object</code> | Model options. |

<a name="FractionalOuModel.parseOpts"></a>

### _FractionalOuModel.parseOpts([opts]) ⇒ <code>Object</code>_

Shared parameter parsing for the fOU family.

**Kind**: static method of [<code>FractionalOuModel</code>](#FractionalOuModel)  
**Returns**: <code>Object</code> - Normalized parameter bundle.

| Param  | Type                | Description    |
| ------ | ------------------- | -------------- |
| [opts] | <code>Object</code> | Model options. |

<a name="FractionalOuModel.buildTimes"></a>

### _FractionalOuModel.buildTimes(nSteps, dt) ⇒ <code>Array.&lt;number&gt;</code>_

Shared time-grid construction for the fOU family.

**Kind**: static method of [<code>FractionalOuModel</code>](#FractionalOuModel)  
**Returns**: <code>Array.&lt;number&gt;</code> - Array of length `nSteps + 1` of cumulative times.

| Param  | Type                | Description               |
| ------ | ------------------- | ------------------------- |
| nSteps | <code>number</code> | Number of discrete steps. |
| dt     | <code>number</code> | Time step size.           |

<a name="EulerMaruyamaFractionalOuModel"></a>

## EulerMaruyamaFractionalOuModel

Euler-Maruyama discretization of the fOU model.

Cheap O(n) integration; first-order accurate.

**Kind**: global class  
<a name="ExactFractionalOuModel"></a>

## ExactFractionalOuModel

Exact Riemann-Liouville discretization of the fOU model.

O(n^2) per path; higher-order accurate.

**Kind**: global class  
<a name="MultifractionalPreModel"></a>

## _MultifractionalPreModel_

Abstract base class for the Multifractional Process with Random
Exponent.

    X_t = B_{H(t)}(t)

where `H(t)` itself is a stochastic Ornstein-Uhlenbeck process
bounded between `hMin` and `hMax`. Two concrete subclasses pick the
discretization scheme:

- [LocalHolderMultifractionalPreModel](#LocalHolderMultifractionalPreModel) — default, cheap
- [ExactMultifractionalPreModel](#ExactMultifractionalPreModel) — time-varying kernel

**Kind**: global abstract class  
<a name="MultifractionalPreModel.generateHPath"></a>

### _MultifractionalPreModel.generateHPath(opts) ⇒ <code>Array.&lt;number&gt;</code>_

Shared `H(t)` path generation under an OU bridge.

**Kind**: static method of [<code>MultifractionalPreModel</code>](#MultifractionalPreModel)  
**Returns**: <code>Array.&lt;number&gt;</code> - Generated `H(t)` path of length `nSteps + 1`.

| Param | Type                | Description    |
| ----- | ------------------- | -------------- |
| opts  | <code>Object</code> | Model options. |

<a name="LocalHolderMultifractionalPreModel"></a>

## LocalHolderMultifractionalPreModel

Local-Holder approximation of the mPRE model.

Cheap O(n) integration via cumulative `sqrt(dt^{2 * H_avg})` scaling.

**Kind**: global class  
<a name="ExactMultifractionalPreModel"></a>

## ExactMultifractionalPreModel

Exact time-varying-kernel discretization of the mPRE model.

O(n^2) per path; uses a time-varying Riemann-Liouville kernel.

**Kind**: global class  
<a name="Sampler"></a>

## _Sampler_

Abstract base class for sampling strategies.

A `Sampler` is a _strategy_: callers obtain a fresh instance and
invoke `draw(inc, n)` once per variance-reduction iteration. The
estimator never holds sampler state across calls so strategies can be
safely shared across estimator instances.

**Kind**: global abstract class  
<a name="Sampler+draw"></a>

### **sampler.draw(inc, n) ⇒ <code>Array.&lt;number&gt;</code>**

Draws a sub-sample of size `n` from `inc`.

**Kind**: instance abstract method of [<code>Sampler</code>](#Sampler)  
**Returns**: <code>Array.&lt;number&gt;</code> - Sampled sub-array.

| Param | Type                                                           | Description                        |
| ----- | -------------------------------------------------------------- | ---------------------------------- |
| inc   | <code>Array.&lt;number&gt;</code> \| <code>Float64Array</code> | Increment array at a single scale. |
| n     | <code>number</code>                                            | Desired sample size.               |

<a name="HurstifyErrorCode"></a>

## HurstifyErrorCode : <code>enum</code>

Stable error codes. Treat the string values as part of the public
API — renaming them is a breaking change.

**Kind**: global enum  
<a name="LogLevel"></a>

## LogLevel : <code>enum</code>

Severity levels, numerically ordered from most to least verbose.

- `DEBUG` (0): per-step diagnostics, only useful for tracing algorithm
  internals.
- `INFO` (1): high-level progress messages.
- `WARN` (2): recoverable issues (default cut-off).
- `ERROR` (3): unhandled failures during processing.
- `SILENT` (4): disables all logging; convenience for tests.

**Kind**: global enum  
<a name="NORMAL_QUANTILE_COEFFS"></a>

## NORMAL\_QUANTILE\_COEFFS

Coefficients for the Beasley-Springer-Malkin rational approximation of
the inverse standard normal CDF. Used piecewise for `p in [pLow, 1 -
pLow]` (central region) and tail rational functions for the extremes.

The standard deviation may be `c/d` constants at the tails is adapted
from Peter Acklam's algorithm.

**Kind**: global constant  
<a name="modelRegistry"></a>

## modelRegistry : [<code>Registry.&lt;StochasticModel&gt;</code>](#StochasticModel)

Strategy registry for stochastic models. The default `fOU` key
resolves to the Euler-Maruyama discretization; consumers who want
the exact Riemann-Liouville variant look up `fOU-exact`. Same
convention for `mPRE` / `mPRE-exact`.

**Kind**: global constant  
<a name="forecasterRegistry"></a>

## forecasterRegistry : [<code>Registry.&lt;Forecaster&gt;</code>](#Forecaster)

Strategy registry for forecasters.

**Kind**: global constant  
<a name="optimizerRegistry"></a>

## optimizerRegistry : [<code>Registry.&lt;Optimizer&gt;</code>](#Optimizer)

Global optimizer registry.

**Kind**: global constant  
<a name="parseCsv"></a>

## parseCsv(csv, opts) ⇒ <code>Array.&lt;Object&gt;</code>

Parses a CSV string into an array of plain objects.

Expected input shape:

- The first non-empty line is the header row.
- Each subsequent line is a record with the same column count as the
  header.
- Fields can be optionally wrapped in double quotes; quotes may embed
  commas but not other escapes.

Type coercion:

- `opts.dateField` (default `"date"`) is parsed via `new Date(...)`.
- Any field listed in `opts.numericFields` is parsed via `parseFloat`.
- All other fields are kept as trimmed strings.

Error handling:

- Empty input returns `[]`.
- Mismatched column counts throw with a descriptive message.
- Non-numeric values in declared numeric columns throw.

**Kind**: global function  
**Returns**: <code>Array.&lt;Object&gt;</code> - Parsed rows, one per non-empty CSV line.  
**Throws**:

- <code>Error</code> When the input is malformed.

| Param                | Type                              | Description                          |
| -------------------- | --------------------------------- | ------------------------------------ |
| csv                  | <code>string</code>               | Raw CSV content.                     |
| opts                 | <code>Object</code>               | Parser options.                      |
| [opts.dateField]     | <code>string</code>               | Date column name (default `"date"`). |
| [opts.numericFields] | <code>Array.&lt;string&gt;</code> | Columns to coerce to numbers.        |

<a name="splitCSVLine"></a>

## splitCSVLine(line) ⇒ <code>Array.&lt;string&gt;</code>

Splits a single CSV line respecting double-quoted regions.

States:

- Outside quotes: a comma terminates the current field.
- Inside quotes: a quote toggles back to "outside", all other chars are
  kept verbatim.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Split fields. Empty trailing field is preserved.

| Param | Type                | Description                         |
| ----- | ------------------- | ----------------------------------- |
| line  | <code>string</code> | Raw CSV line (no trailing newline). |

<a name="extractSeries"></a>

## extractSeries(rows, field, opts) ⇒ <code>Array.&lt;{date: Date, value: number}&gt;</code>

Extracts a `{date, value}` series from a parsed CSV array.

Rows that are missing `field` are skipped; the resulting series is
optionally sorted by `dateField` when the caller asks. Sorting uses
the standard JS `Date` arithmetic, so the dates must be real `Date`
instances.

**Kind**: global function  
**Returns**: <code>Array.&lt;{date: Date, value: number}&gt;</code> - Series of `{date, value}`
points.  
**Throws**:

- <code>Error</code> When `rows` is not an array or `field` is not a string.

| Param             | Type                              | Description                                                              |
| ----------------- | --------------------------------- | ------------------------------------------------------------------------ |
| rows              | <code>Array.&lt;Object&gt;</code> | Parsed CSV rows.                                                         |
| field             | <code>string</code>               | Numeric field name to extract.                                           |
| opts              | <code>Object</code>               | Extraction options.                                                      |
| [opts.sortByDate] | <code>boolean</code>              | When `true`, sort by the date field before extraction (default `false`). |
| [opts.dateField]  | <code>string</code>               | Date field name (default `"date"`).                                      |

<a name="parseJson"></a>

## parseJson(json) ⇒ <code>Array.&lt;Object&gt;</code>

Parses a JSON string that must encode an array of objects.

The function deliberately refuses non-array JSON to keep the loader
simple. Empty or whitespace-only input returns `[]`.

**Kind**: global function  
**Returns**: <code>Array.&lt;Object&gt;</code> - Parsed objects (empty if the input is empty).  
**Throws**:

- <code>Error</code> When the input is not valid JSON or does not decode
  to an array.

| Param | Type                | Description      |
| ----- | ------------------- | ---------------- |
| json  | <code>string</code> | Raw JSON string. |

<a name="validateNoGaps"></a>

## validateNoGaps(series, maxGapMs) ⇒ <code>Object</code>

Validates that a time series does not contain temporal gaps larger
than `maxGapMs`.

Returns the maximum observed gap, the full list of pairwise gap
lengths, and a `valid` flag for the threshold check. Series with
fewer than two points are deemed valid by definition.

**Kind**: global function  
**Returns**: <code>Object</code> - Validation result.

| Param    | Type                                    | Description                          |
| -------- | --------------------------------------- | ------------------------------------ |
| series   | <code>Array.&lt;{date: Date}&gt;</code> | Time series with `Date` fields.      |
| maxGapMs | <code>number</code>                     | Maximum allowed gap in milliseconds. |

<a name="downsampleSeries"></a>

## downsampleSeries(series, intervalMs) ⇒ <code>Array.&lt;{date: Date, value: number}&gt;</code>

Downsamples a time series by averaging values that fall into fixed
`intervalMs`-wide buckets.

The bucket index is computed as
`floor(date.getTime() / intervalMs)`,
so all buckets share the same left edge (`0`, `intervalMs`,
`2 * intervalMs`, ...). The output is sorted by date and every
returned point carries the _bucket start_ (not the average timestamp)
as its `date` value.

**Kind**: global function  
**Returns**: <code>Array.&lt;{date: Date, value: number}&gt;</code> - One entry per non-empty
bucket, sorted chronologically.  
**Throws**:

- <code>Error</code> When `series` is not an array or `intervalMs <= 0`.

| Param      | Type                                                   | Description                    |
| ---------- | ------------------------------------------------------ | ------------------------------ |
| series     | <code>Array.&lt;{date: Date, value: number}&gt;</code> | Input series.                  |
| intervalMs | <code>number</code>                                    | Bucket length in milliseconds. |

<a name="preaverageReturns"></a>

## preaverageReturns(prices, [windowSize]) ⇒ <code>Array.&lt;number&gt;</code>

Preaveraging of log-returns.

Implementation of the Jacod et al. (2009) preaveraging estimator
(simplified single-bar variant):

1. Compute log-returns `r_t = log(P_t / P_{t-1})`.
2. For each `i`, average the `windowSize` consecutive returns ending at
   `i` (`g_avg[i] = mean(r_{i - windowSize + 1}, ..., r_i)`).
3. The "preaveraged return" is the first-difference sequence
   `g_avg[i] - g_avg[i - 1]`. This cancellation attenuates
   microstructure noise by `1/sqrt(windowSize)` while preserving the
   drift and diffusion up to `O(1 / windowSize)`.

Note: the result has length `prices.length - windowSize - 1`; for
very short series the function throws rather than returning a few
noisy points.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Preaveraged-returns series.  
**Throws**:

- <code>Error</code> When `prices` has fewer than `windowSize + 1`
  elements.

| Param        | Type                              | Description                        |
| ------------ | --------------------------------- | ---------------------------------- |
| prices       | <code>Array.&lt;number&gt;</code> | Price series.                      |
| [windowSize] | <code>number</code>               | Preaveraging window (default `2`). |

<a name="computeRealizedKernel"></a>

## computeRealizedKernel(returns, [kernelType], [bandwidth]) ⇒ <code>number</code>

Realized-kernel variance estimator with pluggable kernels.

Given `n` returns, the estimator forms the autocorrelation sequence

    gamma_k = sum_{i=k+1}^{n} r_i * r_{i - k},  k = 0..h

and combines them through a weighted sum

    RV_K = gamma_0 + 2 * sum_{k=1..h} w_k * gamma_k

with weights `w_k` provided by the chosen kernel. The default
`bandwidth` is `floor(n^0.6)`, a rule-of-thumb that matches the
optimal scaling under i.i.d. microstructure noise.

Kernels shipped:

- `bartlett`: `w_k = 1 - k / h` (default).
- `parzen`: the standard piecewise-cubic Parzen kernel.
- `tukey-hanning`: `0.5 (1 + cos(pi k / h))`.

Any unknown kernel name falls back to Bartlett.

**Kind**: global function  
**Returns**: <code>number</code> - Realized-kernel variance (clamped to be
non-negative).  
**Throws**:

- <code>Error</code> When `returns` is empty.

| Param        | Type                              | Description                                                                |
| ------------ | --------------------------------- | -------------------------------------------------------------------------- |
| returns      | <code>Array.&lt;number&gt;</code> | Log-return series.                                                         |
| [kernelType] | <code>string</code>               | One of `"bartlett"`, `"parzen"`, `"tukey-hanning"` (default `"bartlett"`). |
| [bandwidth]  | <code>number</code>               | Optional explicit bandwidth; defaults to `floor(n^0.6)`.                   |

<a name="kernelWeight"></a>

## kernelWeight(type, k, h) ⇒ <code>number</code>

Kernel weight function used by [realizedKernel](realizedKernel).

**Kind**: global function  
**Returns**: <code>number</code> - Weight for the `k`-th autocorrelation lag.

| Param | Type                | Description                                                      |
| ----- | ------------------- | ---------------------------------------------------------------- |
| type  | <code>string</code> | Kernel identifier (`"bartlett"`, `"parzen"`, `"tukey-hanning"`). |
| k     | <code>number</code> | Lag index (`k >= 0`).                                            |
| h     | <code>number</code> | Bandwidth (`h > 0`).                                             |

<a name="debiasLogVolatility"></a>

## debiasLogVolatility(rawHEstimates, sigmaObs, sigmaLatent) ⇒ <code>Array.&lt;number&gt;</code>

Heuristic de-biasing of log-volatility H estimates.

Microstructure noise inflates the variance of the log-volatility proxy
relative to the latent signal, which in turn attenuates the
observed roughness. This routine adds a small correction

    h_debias = h + 0.01 * log(sigmaObs / sigmaLatent)

and clamps the result to `[0.01, 0.99]`. It is intentionally
conservative — the user is expected to validate the calibration
against a trust sample before relying on it for production.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - De-biased H estimates.  
**Throws**:

- <code>Error</code> When `sigmaLatent <= 0`.

| Param         | Type                              | Description                                                 |
| ------------- | --------------------------------- | ----------------------------------------------------------- |
| rawHEstimates | <code>Array.&lt;number&gt;</code> | Raw H estimates from `Hurstify.estimate` or `rolling`.      |
| sigmaObs      | <code>number</code>               | Standard deviation of the observed log-vol series.          |
| sigmaLatent   | <code>number</code>               | Standard deviation of the latent (denoised) log-vol series. |

<a name="computeRealizedVariance"></a>

## computeRealizedVariance(prices, [interval]) ⇒ <code>Array.&lt;number&gt;</code>

Computes per-bucket realized variance from a price series.

The realized variance is the sum of squared log-returns within each
non-overlapping bucket of `interval` observations:

    RV_k = sum_{i in bucket k} (log P_i - log P_{i-1})^2

With `interval = 1` the function emits one RV per log-return
directly, which is the canonical "5-minute RV" form when prices are
already sampled at 5-minute intervals.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Realized-variance series.  
**Throws**:

- <code>Error</code> When `prices` is missing, has fewer than two
  elements, contains non-finite or non-positive values, or
  `interval` is not a positive integer.

| Param      | Type                              | Description                                             |
| ---------- | --------------------------------- | ------------------------------------------------------- |
| prices     | <code>Array.&lt;number&gt;</code> | Chronological price series (strictly positive, finite). |
| [interval] | <code>number</code>               | Bucket size (default `1`; must be a positive integer).  |

<a name="computeRealizedVarianceParkinson"></a>

## computeRealizedVarianceParkinson(bars) ⇒ <code>Array.&lt;number&gt;</code>

Parkinson (1980) high-low RV estimator from OHLC bars.

For each bar the within-period variance is approximated by

    sigma^2 ~= (log(H/L))^2 / (4 * ln 2)

which is `1/(4 ln 2) ~ 0.36` of the log-range-squared. Parkinson is
strictly less efficient than tick-based RV but only requires four
numbers per bar.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - One Parkinson variance estimate per bar.  
**Throws**:

- <code>Error</code> When `bars` is not an array or any bar has
  non-positive/non-finite `high`/`low` values.

| Param | Type                                                                                | Description |
| ----- | ----------------------------------------------------------------------------------- | ----------- |
| bars  | <code>Array.&lt;{open: number, high: number, low: number, close: number}&gt;</code> | OHLC bars.  |

<a name="aggregateDailyRealizedVariance"></a>

## aggregateDailyRealizedVariance(intradayRVs) ⇒ <code>number</code>

Aggregates intraday (5-minute) realized variances into a single daily
value via plain summation.

This is the standard "sum of squared returns" daily RV used in
financial econometrics. It assumes the input is already free of
overnight gaps.

**Kind**: global function  
**Returns**: <code>number</code> - Sum of the intraday RVs (zero for an empty input).  
**Throws**:

- <code>Error</code> When `intradayRVs` is not an array.

| Param       | Type                              | Description               |
| ----------- | --------------------------------- | ------------------------- |
| intradayRVs | <code>Array.&lt;number&gt;</code> | Sequence of 5-minute RVs. |

<a name="applyLogTransform"></a>

## applyLogTransform(rv) ⇒ <code>Array.&lt;number&gt;</code>

Maps realized variance to the log-volatility series consumed by
hurstify.

The transformation is

    X_t = 0.5 * log(RV_t)

i.e. `log(sqrt(RV))`. This converts multiplicative variance dynamics
into a roughly additive (and therefore more stationary) signal, on
top of which the self-similarity property exploited by the RK-SAVR algorithm is
expressed.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Log-volatility series.  
**Throws**:

- <code>Error</code> When `rv` is not an array or contains non-positive
  / non-finite values.

| Param | Type                              | Description               |
| ----- | --------------------------------- | ------------------------- |
| rv    | <code>Array.&lt;number&gt;</code> | Realized-variance series. |

<a name="centerSeries"></a>

## centerSeries(series) ⇒ <code>Array.&lt;number&gt;</code>

Subtracts the arithmetic mean from every element.

Useful as a final step in the preprocessing pipeline when the user
wants the series to mean-zero (which can stabilize variance-reducing
permutations inside `Hurstify`).

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - New array of length `series.length` with the
mean subtracted. Empty input yields `[]`.

| Param  | Type                              | Description   |
| ------ | --------------------------------- | ------------- |
| series | <code>Array.&lt;number&gt;</code> | Input series. |

<a name="standardizeSeries"></a>

## standardizeSeries(series) ⇒ <code>Array.&lt;number&gt;</code>

Standardizes a time series to zero mean and unit variance.

Divides each centered value by the population standard deviation.
A constant series has zero variance and triggers an explicit error
rather than silently producing `NaN`s.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Standardized copy of `series`.  
**Throws**:

- <code>Error</code> When `series` has fewer than two elements or
  population variance zero.

| Param  | Type                              | Description                               |
| ------ | --------------------------------- | ----------------------------------------- |
| series | <code>Array.&lt;number&gt;</code> | Input series (needs at least two points). |

<a name="applyPreprocessingPipeline"></a>

## applyPreprocessingPipeline(prices, opts) ⇒ <code>Array.&lt;number&gt;</code>

Bundled preprocessing pipeline: `prices -> RV -> log-vol -> (optional)
centering`.

Equivalent to running [computeRV](computeRV) + [logTransform](logTransform) +
(optionally) [centerSeries](#centerSeries), but more compact for callers who
want the canonical transformation.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Preprocessed log-volatility series.

| Param           | Type                              | Description                                                                                 |
| --------------- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| prices          | <code>Array.&lt;number&gt;</code> | Chronological price series.                                                                 |
| opts            | <code>Object</code>               | Pipeline options.                                                                           |
| [opts.interval] | <code>number</code>               | RV aggregation interval (default `1`).                                                      |
| [opts.center]   | <code>boolean</code>              | When `true`, subtract the mean from the log-volatility series at the end (default `false`). |

<a name="splitTrainTest"></a>

## splitTrainTest(series, [trainRatio]) ⇒ <code>Object</code>

Splits a series into contiguous training and test arrays.

The split point is `floor(series.length * trainRatio)` so the training
set is the leftmost prefix of the series; this preserves temporal
ordering, which is what hurstify forecasters and validation scripts
typically need.

**Kind**: global function  
**Returns**: <code>Object</code> - Train/test
arrays.  
**Throws**:

- <code>Error</code> When `series` is not an array or `trainRatio` is out
  of range.

| Param        | Type                              | Description                                    |
| ------------ | --------------------------------- | ---------------------------------------------- |
| series       | <code>Array.&lt;number&gt;</code> | Input series.                                  |
| [trainRatio] | <code>number</code>               | Training fraction in `(0, 1)` (default `0.8`). |

<a name="createSlidingWindows"></a>

## createSlidingWindows(series, windowSize, [step]) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>

Builds overlapping windows from a single time series.

The i-th window is `series.slice(i, i + windowSize)` for `i = 0, step,
2*step, ...` until no full window fits. Used by offline batch
evaluation pipelines that want to score the estimator on every
available segment of the series.

**Kind**: global function  
**Returns**: <code>Array.&lt;Array.&lt;number&gt;&gt;</code> - One entry per non-truncated window.  
**Throws**:

- <code>Error</code> When `series` is not an array or `windowSize`/`step`
  are non-positive.

| Param      | Type                              | Description                                       |
| ---------- | --------------------------------- | ------------------------------------------------- |
| series     | <code>Array.&lt;number&gt;</code> | Input series.                                     |
| windowSize | <code>number</code>               | Window length (positive integer).                 |
| [step]     | <code>number</code>               | Stride between consecutive windows (default `1`). |

<a name="generateVixLogVolatility"></a>

## generateVixLogVolatility(nDays, h, opts) ⇒ <code>Array.&lt;number&gt;</code>

Synthetic VIX-style daily log-volatility.

Generates an fBM with the requested `h` and maps it to a log-volatility
level around `2.0` (i.e. `sqrt(RV) ~ 20%`) by adding a small drift
term and Gaussian observation noise:

    X_t = 2.0 + drift * (fbm[t] / sqrt(n)) + 0.5 * fbm[t] + noise

Default tuning matches the empirical VIX roughness (`h ~ 0.1`) and
annualized log-vol mean.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Daily log-volatility series. Empty when
`nDays <= 0`.  
**Throws**:

- <code>Error</code> When `h` is out of `(0, 1)`.

| Param           | Type                | Description                                            |
| --------------- | ------------------- | ------------------------------------------------------ |
| nDays           | <code>number</code> | Number of trading days.                                |
| h               | <code>number</code> | Hurst parameter (default `0.1`).                       |
| opts            | <code>Object</code> | Generation options.                                    |
| [opts.seed]     | <code>number</code> | PRNG seed for reproducibility.                         |
| [opts.noiseStd] | <code>number</code> | Observation-noise standard deviation (default `0.05`). |
| [opts.drift]    | <code>number</code> | Log-volatility drift (default `0.02`).                 |

<a name="generateSpxLogVolatility"></a>

## generateSpxLogVolatility(nDays, h, opts) ⇒ <code>Array.&lt;number&gt;</code>

Synthetic S&P 500 realized-volatility style daily log-volatility.

Same construction as [generateVIXLogVol](generateVIXLogVol) but with a smoother
default Hurst (`h = 0.14`), a smaller drift, and a less volatile
observation-noise level. Empirically these choices match the rough
regime typically reported for SPX RV.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Daily log-volatility series. Empty when
`nDays <= 0`.  
**Throws**:

- <code>Error</code> When `h` is out of `(0, 1)`.

| Param           | Type                | Description                                            |
| --------------- | ------------------- | ------------------------------------------------------ |
| nDays           | <code>number</code> | Number of trading days.                                |
| h               | <code>number</code> | Hurst parameter (default `0.14`).                      |
| opts            | <code>Object</code> | Generation options.                                    |
| [opts.seed]     | <code>number</code> | PRNG seed.                                             |
| [opts.noiseStd] | <code>number</code> | Observation-noise standard deviation (default `0.03`). |
| [opts.drift]    | <code>number</code> | Log-volatility drift (default `0.015`).                |

<a name="generateIntradayPrices"></a>

## generateIntradayPrices([nIntraday], [nDays], h, opts) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>

Generates synthetic intraday 5-minute prices useful for testing
realized-variance pipelines.

For every (re-)sampled day the generator draws an fBM with the
requested `h`, exponentiates it into a volatility factor, and steps a
log-return process

    S_{i+1} = S_i * exp(drift + vol_i * z_i * sqrt(dt))

with `drift` set to the per-5-minute-bar annualized drift. The result
is a `nDays` x `nIntraday` array of prices suitable for feeding into
[computeRV](computeRV).

**Kind**: global function  
**Returns**: <code>Array.&lt;Array.&lt;number&gt;&gt;</code> - Array of daily price arrays.  
**Throws**:

- <code>Error</code> When `nIntraday <= 0`, `nDays <= 0`, or `h` is out of
  `(0, 1)`.

| Param        | Type                | Description                                                                    |
| ------------ | ------------------- | ------------------------------------------------------------------------------ |
| [nIntraday]  | <code>number</code> | Number of 5-minute bars per day (default `78`, the typical US-equities count). |
| [nDays]      | <code>number</code> | Number of days to simulate (default `1`).                                      |
| h            | <code>number</code> | Hurst parameter.                                                               |
| opts         | <code>Object</code> | Generation options.                                                            |
| [opts.seed]  | <code>number</code> | PRNG seed for reproducibility.                                                 |
| [opts.drift] | <code>number</code> | Annualized drift (default `0.05`).                                             |

<a name="seriesToCsv"></a>

## seriesToCsv(series, [dateHeader], [valueHeader]) ⇒ <code>string</code>

Serializes a `{date, value}` series as a CSV string.

Dates that are `Date` instances are formatted as their ISO yyyy-mm-dd
prefix; everything else is stringified verbatim. Empty series
produces a header-only CSV.

**Kind**: global function  
**Returns**: <code>string</code> - CSV-encoded content joined with `\n`.  
**Throws**:

- <code>Error</code> When `series` is not an array.

| Param         | Type                              | Description                                      |
| ------------- | --------------------------------- | ------------------------------------------------ |
| series        | <code>Array.&lt;Object&gt;</code> | Time series with `date` and `value` fields.      |
| [dateHeader]  | <code>string</code>               | Header for the date column (default `"date"`).   |
| [valueHeader] | <code>string</code>               | Header for the value column (default `"value"`). |

<a name="buildScaleProfile"></a>

## buildScaleProfile(sortedSamples, scales, H) ⇒ <code>Array.&lt;number&gt;</code>

Builds a flat "profile" of all pairwise KS distances at a fixed `H`.

Given `K` sorted samples, the profile has `K * (K - 1) / 2` entries
corresponding to every unordered scale pair. Useful for diagnostics.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Flat array of pairwise KS distances.

| Param         | Type                                    | Description         |
| ------------- | --------------------------------------- | ------------------- |
| sortedSamples | <code>Array.&lt;Float64Array&gt;</code> | Pre-sorted samples. |
| scales        | <code>Array.&lt;number&gt;</code>       | Scale values.       |
| H             | <code>number</code>                     | Hurst parameter.    |

<a name="getAsymptoticVariance"></a>

## getAsymptoticVariance(scaleA1, scaleA2, n, m) ⇒ <code>number</code>

Asymptotic variance of the Hurstify estimator.

Implements

    Var(H_hat) = (2 * pi * e) / (ln(a2/a1))^2 * (1/sqrt(n) + 1/sqrt(m))^2.

When `a1 == a2` (log ratio zero) the variance is degenerate and the
function returns `Infinity` rather than dividing by zero; callers that
intend to compute a SE/CI should reject equal scales up-front.

**Kind**: global function  
**Returns**: <code>number</code> - Non-negative asymptotic variance (`Infinity` if the
scales coincide).

| Param   | Type                | Description           |
| ------- | ------------------- | --------------------- |
| scaleA1 | <code>number</code> | Lower scale `a_1`.    |
| scaleA2 | <code>number</code> | Upper scale `a_2`.    |
| n       | <code>number</code> | Sample size at `a_1`. |
| m       | <code>number</code> | Sample size at `a_2`. |

<a name="getStandardError"></a>

## getStandardError(scaleA1, scaleA2, n, m) ⇒ <code>number</code>

Asymptotic standard error: square root of the asymptotic variance.

Thin convenience wrapper. The standard error has units of "Hurst" and
can be read against the `hMin`/`hMax` bounds the estimator was
configured with.

**Kind**: global function  
**Returns**: <code>number</code> - Non-negative standard error (`Infinity` for degenerate
scale choices).

| Param   | Type                | Description           |
| ------- | ------------------- | --------------------- |
| scaleA1 | <code>number</code> | Lower scale `a_1`.    |
| scaleA2 | <code>number</code> | Upper scale `a_2`.    |
| n       | <code>number</code> | Sample size at `a_1`. |
| m       | <code>number</code> | Sample size at `a_2`. |

<a name="getConfidenceInterval"></a>

## getConfidenceInterval(hEstimate, scaleA1, scaleA2, n, m, alpha) ⇒ <code>Object</code>

Two-sided asymptotic confidence interval for `H`.

Combines the asymptotic standard error with the standard-normal
critical value `z_{1 - alpha/2}` (computed by the internal
`normalQuantile`) to produce

    CI = H_hat +/- z * SE.

Note: this CI is **not** clipped to `[0, 1]`. For practical reporting
users may want to clamp to `[hMin, hMax]`.

**Kind**: global function  
**Returns**: <code>Object</code> - Confidence interval bounds.

| Param     | Type                | Description                          |
| --------- | ------------------- | ------------------------------------ |
| hEstimate | <code>number</code> | Point estimate of `H`.               |
| scaleA1   | <code>number</code> | Lower scale `a_1`.                   |
| scaleA2   | <code>number</code> | Upper scale `a_2`.                   |
| n         | <code>number</code> | Sample size at `a_1`.                |
| m         | <code>number</code> | Sample size at `a_2`.                |
| alpha     | <code>number</code> | Significance level (default `0.05`). |

<a name="runKalmanFilter"></a>

## runKalmanFilter(observations, opts) ⇒ <code>Object</code>

One-dimensional Kalman filter for H(t) smoothing.

State: `x_t = H_t`. Transition: `H_t = H_{t-1} + w_t`, `w_t ~ N(0, q)`.
Observation: `z_t = H_t + v_t`, `v_t ~ N(0, r)`.

The filter is seeded with the first observation (`x_0 = z_0`) and a
unit prior covariance. Each subsequent step performs:

1. **Predict:** `xPred = x`, `pPred = p + q`.
2. **Update:** `K = pPred / (pPred + r)`, `x = xPred + K * (z - xPred)`,
   `p = (1 - K) * pPred`.

The result captures both the one-step-ahead predictions (before
incorporating the observation) and the filtered states (after).

**Kind**: global function  
**Returns**: <code>Object</code> - Filtered and one-step-predicted states, each of length `n`.

| Param        | Type                              | Description                                 |
| ------------ | --------------------------------- | ------------------------------------------- |
| observations | <code>Array.&lt;number&gt;</code> | Time-ordered `H` estimates.                 |
| opts         | <code>Object</code>               | Filter options.                             |
| [opts.q]     | <code>number</code>               | Process noise variance (default `0.01`).    |
| [opts.r]     | <code>number</code>               | Measurement noise variance (default `0.1`). |

<a name="normalQuantile"></a>

## normalQuantile(p) ⇒ <code>number</code>

Inverse standard normal CDF (quantile function).

Implementation: piecewise rational approximation due to Beasley &
Springer (1977) / Acklam (2010). The central region
`p in [pLow, 1 - pLow]` uses a degree-5/4 rational function of
`r2 = (p - 0.5)^2`; the tails use a degree-3/3 rational function of
`q = sqrt(-2 ln p)` (or `q = sqrt(-2 ln (1 - p))` for the upper tail).

- `p <= 0` returns `-Infinity`.
- `p >= 1` returns `Infinity`.
- `p === 0.5` returns exactly `0`.

Numerical accuracy is `~1e-9` across the open interval `(0, 1)`.

**Kind**: global function  
**Returns**: <code>number</code> - Quantile `Phi^{-1}(p)`.

| Param | Type                | Description              |
| ----- | ------------------- | ------------------------ |
| p     | <code>number</code> | Probability in `[0, 1]`. |

<a name="normalCdf"></a>

## normalCdf(x) ⇒ <code>number</code>

Standard normal CDF via the Abramowitz & Stegun rational
approximation (7.1.26).

Numerical accuracy is `~7.5e-8` over the whole real line. This is the
inverse-of-complement of [normalQuantile](#normalQuantile) and is shared by every
inference routine that needs a closed-form normal tail probability
(currently the constancy likelihood-ratio test in
`inference/filtering.js`).

**Kind**: global function  
**Returns**: <code>number</code> - `P(Z <= x)` for `Z ~ N(0, 1)`, in `[0, 1]`.

| Param | Type                | Description                    |
| ----- | ------------------- | ------------------------------ |
| x     | <code>number</code> | Input value (any real number). |

<a name="setLogLevel"></a>

## setLogLevel(level)

Sets the current log level.

**Kind**: global function

| Param | Type                | Description                              |
| ----- | ------------------- | ---------------------------------------- |
| level | <code>number</code> | One of the `LogLevel` numeric constants. |

<a name="getLogLevel"></a>

## getLogLevel() ⇒ <code>number</code>

Reads the current log level.

**Kind**: global function  
**Returns**: <code>number</code> - Active `LogLevel` value.  
<a name="log"></a>

## log(level, label, args)

Internal dispatcher: drops the message if it falls below the configured
cut-off, otherwise forwards to the appropriate `console.*` channel.

**Kind**: global function

| Param | Type                          | Description                                     |
| ----- | ----------------------------- | ----------------------------------------------- |
| level | <code>number</code>           | Log level (one of `LogLevel.*`).                |
| label | <code>string</code>           | Short human label (`DEBUG`, `INFO`, ...).       |
| args  | <code>Array.&lt;\*&gt;</code> | Arguments to forward to the underlying console. |

<a name="debug"></a>

## debug(...args)

Emits a message at `DEBUG` level.

**Kind**: global function

| Param   | Type            | Description                          |
| ------- | --------------- | ------------------------------------ |
| ...args | <code>\*</code> | Values forwarded to `console.debug`. |

<a name="info"></a>

## info(...args)

Emits a message at `INFO` level.

**Kind**: global function

| Param   | Type            | Description                         |
| ------- | --------------- | ----------------------------------- |
| ...args | <code>\*</code> | Values forwarded to `console.info`. |

<a name="warn"></a>

## warn(...args)

Emits a message at `WARN` level (visible by default).

**Kind**: global function

| Param   | Type            | Description                         |
| ------- | --------------- | ----------------------------------- |
| ...args | <code>\*</code> | Values forwarded to `console.warn`. |

<a name="error"></a>

## error(...args)

Emits a message at `ERROR` level (visible by default).

**Kind**: global function

| Param   | Type            | Description                          |
| ------- | --------------- | ------------------------------------ |
| ...args | <code>\*</code> | Values forwarded to `console.error`. |

<a name="getModel"></a>

## getModel(name) ⇒ [<code>StochasticModel</code>](#StochasticModel) \| <code>undefined</code>

Retrieves a registered model strategy by name.

**Kind**: global function  
**Returns**: [<code>StochasticModel</code>](#StochasticModel) \| <code>undefined</code> - The strategy instance, or `undefined` when the name is unknown.

| Param | Type                | Description       |
| ----- | ------------------- | ----------------- |
| name  | <code>string</code> | Model identifier. |

<a name="registerModel"></a>

## registerModel(name, factory)

Registers a new model strategy under the supplied name.

**Kind**: global function

| Param   | Type                  | Description                         |
| ------- | --------------------- | ----------------------------------- |
| name    | <code>string</code>   | Unique identifier.                  |
| factory | <code>function</code> | Factory returning a fresh instance. |

<a name="listModels"></a>

## listModels() ⇒ <code>Array.&lt;string&gt;</code>

Lists every registered model strategy identifier.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Snapshot of registered model keys.  
<a name="getForecaster"></a>

## getForecaster(name) ⇒ [<code>Forecaster</code>](#Forecaster) \| <code>undefined</code>

Retrieves a registered forecaster by name.

**Kind**: global function  
**Returns**: [<code>Forecaster</code>](#Forecaster) \| <code>undefined</code> - The strategy instance.

| Param | Type                | Description            |
| ----- | ------------------- | ---------------------- |
| name  | <code>string</code> | Forecaster identifier. |

<a name="registerForecaster"></a>

## registerForecaster(name, factory)

Registers a new forecaster strategy under the supplied name.

**Kind**: global function

| Param   | Type                  | Description                         |
| ------- | --------------------- | ----------------------------------- |
| name    | <code>string</code>   | Unique identifier.                  |
| factory | <code>function</code> | Factory returning a fresh instance. |

<a name="listForecasters"></a>

## listForecasters() ⇒ <code>Array.&lt;string&gt;</code>

Lists every registered forecaster identifier.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Snapshot of registered forecaster keys.  
<a name="runAdaptiveGridSearch"></a>

## runAdaptiveGridSearch(f, min, max, opts) ⇒ <code>Object</code>

Adaptive grid search with Brent refinement for 1D minimization.

Algorithm:

1. Initialize with the midpoint of `[min, max]`.
2. Repeat `refineIters` times:
   - Sample `gridSize` evenly spaced points across `[a, b]`.
   - Track the best point.
   - Shrink `[a, b]` to `[best - 2*step, best + 2*step]` clamped to the
     original interval.
   - Stop early if `[a, b]` shrinks below `tol`.
3. Polish the local minimum with Brent's method using `bestX` as the
   initial guess.

The Brent refinement makes the function value at the returned `x`
accurate to machine epsilon in nearly all cases.

**Kind**: global function  
**Returns**: <code>Object</code> - Best point and its objective value.  
**Throws**:

- <code>Error</code> When `gridSize <= 1`.

| Param              | Type                  | Description                                                 |
| ------------------ | --------------------- | ----------------------------------------------------------- |
| f                  | <code>function</code> | Objective function (1D).                                    |
| min                | <code>number</code>   | Lower bound.                                                |
| max                | <code>number</code>   | Upper bound.                                                |
| opts               | <code>Object</code>   | Algorithm options.                                          |
| [opts.gridSize]    | <code>number</code>   | Number of coarse-grid points per refinement (default `50`). |
| [opts.refineIters] | <code>number</code>   | Number of refinement rounds (default `3`).                  |
| [opts.tol]         | <code>number</code>   | Convergence tolerance (default `1e-7`).                     |

<a name="runBrent"></a>

## runBrent(f, ax, bx, cx, tol) ⇒ <code>Object</code>

Minimizes `f(x)` on the interval `[ax, cx]` using Brent's method.

The algorithm tracks the best point `x`, the second-best `w`, and the
third-best `v`; it uses a parabolic fit whenever the parabolic step is
safe, otherwise falls back to a golden-section step. Convergence is
declared when `|x - midpoint| <= 2 * tol * |x| + EPS` or when the
iteration cap of 100 is reached.

Invariants:

- The bracket `[a, b]` always contains the minimum.
- `f(x) <= f(w) <= f(v)` at every iteration.

**Kind**: global function  
**Returns**: <code>Object</code> - The argmin `x` and the value `f(x)`.  
**Throws**:

- <code>Error</code> When the bounds are equal or do not bracket `bx`.

| Param | Type                  | Description                             |
| ----- | --------------------- | --------------------------------------- |
| f     | <code>function</code> | The function to minimize.               |
| ax    | <code>number</code>   | Lower bound of the search interval.     |
| bx    | <code>number</code>   | Initial guess within `[ax, cx]`.        |
| cx    | <code>number</code>   | Upper bound of the search interval.     |
| tol   | <code>number</code>   | Convergence tolerance (default `1e-6`). |

<a name="runDifferentialEvolution"></a>

## runDifferentialEvolution(f, x0, opts) ⇒ <code>Object</code>

Differential-evolution minimization over an arbitrary-dimensional
space.

The initial population is drawn uniformly inside `[lb, ub]`. Each
member produces one trial per generation; the trial survives to the
next generation only when its objective is strictly better.

**Kind**: global function  
**Returns**: <code>Object</code> - Best point found and its
objective value.

| Param          | Type                              | Description                                                                                                   |
| -------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| f              | <code>function</code>             | Objective function.                                                                                           |
| x0             | <code>Array.&lt;number&gt;</code> | Initial guess; used only to size the search space and the lower-bound default (`x0[i]` is ignored otherwise). |
| opts           | <code>Object</code>               | Algorithm options.                                                                                            |
| [opts.maxIter] | <code>number</code>               | Maximum generations (default `500`).                                                                          |
| [opts.popSize] | <code>number</code>               | Population size (default `max(20, 10 *   dim)`).                                                              |
| [opts.cr]      | <code>number</code>               | Per-coordinate crossover probability (default `0.7`).                                                         |
| [opts.f]       | <code>number</code>               | Differential scale factor `F` (default `0.8`).                                                                |
| [opts.lb]      | <code>Array.&lt;number&gt;</code> | Per-dimension lower bounds (default `-5` for every dimension).                                                |
| [opts.ub]      | <code>Array.&lt;number&gt;</code> | Per-dimension upper bounds (default `5` for every dimension).                                                 |

<a name="runNelderMead"></a>

## runNelderMead(f, x0, opts) ⇒ <code>Object</code>

Nelder-Mead minimization over a multidimensional space.

Builds an initial simplex by perturbing each axis of `x0` by `1e-4`
and then iterates the standard reflection / expansion / contraction /
shrink move until either the spread of function values is below `tol`
or `maxIter` iterations have been performed.

**Kind**: global function  
**Returns**: <code>Object</code> - Best point, its
function value, and the iteration count at termination.

| Param          | Type                              | Description                                                                            |
| -------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| f              | <code>function</code>             | Objective function.                                                                    |
| x0             | <code>Array.&lt;number&gt;</code> | Initial guess (length determines dimension).                                           |
| opts           | <code>Object</code>               | Algorithm options.                                                                     |
| [opts.maxIter] | <code>number</code>               | Maximum iterations (default `1000`).                                                   |
| [opts.tol]     | <code>number</code>               | Convergence tolerance on the spread of `f` values across the simplex (default `1e-6`). |
| [opts.alpha]   | <code>number</code>               | Reflection coefficient (default `1.0`).                                                |
| [opts.gamma]   | <code>number</code>               | Expansion coefficient (default `2.0`).                                                 |
| [opts.rho]     | <code>number</code>               | Contraction coefficient (default `0.5`).                                               |
| [opts.sigma]   | <code>number</code>               | Shrink coefficient (default `0.5`).                                                    |

<a name="runSimulatedAnnealing"></a>

## runSimulatedAnnealing(f, x0, opts) ⇒ <code>Object</code>

Simulated-annealing minimization over an arbitrary-dimensional space.

The neighbor for each iteration is generated by perturbing every
coordinate by a uniform offset in `[-stepSize, stepSize]`. The
acceptance temperature decays geometrically: `temp *= coolingRate`. The
loop terminates once either `maxIter` iterations are performed or the
temperature drops below `finalTemp`.

**Kind**: global function  
**Returns**: <code>Object</code> - The best point found and its
function value.

| Param              | Type                              | Description                                                      |
| ------------------ | --------------------------------- | ---------------------------------------------------------------- |
| f                  | <code>function</code>             | Objective function.                                              |
| x0                 | <code>Array.&lt;number&gt;</code> | Initial guess.                                                   |
| opts               | <code>Object</code>               | Algorithm options.                                               |
| [opts.maxIter]     | <code>number</code>               | Maximum iterations (default `5000`).                             |
| [opts.initialTemp] | <code>number</code>               | Initial temperature (default `100`).                             |
| [opts.finalTemp]   | <code>number</code>               | Temperature cut-off (default `0.001`).                           |
| [opts.coolingRate] | <code>number</code>               | Per-iteration multiplier (default `0.995`).                      |
| [opts.stepSize]    | <code>number</code>               | Half-width of the uniform proposal distribution (default `0.1`). |

<a name="mulberry32"></a>

## mulberry32(seed) ⇒ <code>function</code>

Constructs a mulberry32 generator with the given 32-bit seed.

The algorithm packs the state into a single unsigned 32-bit integer
`a`. Each call applies two well-known integer mixing steps
(`Math.imul` & bitwise shift) and returns the result divided by
`2^32` so the output is in `[0, 1)`.

**Kind**: global function  
**Returns**: <code>function</code> - A function that returns the next uniform
sample on every call.

| Param | Type                | Description                                                                                |
| ----- | ------------------- | ------------------------------------------------------------------------------------------ |
| seed  | <code>number</code> | PRNG seed (will be coerced to a 32-bit unsigned integer; `>>> 0` performs the conversion). |

<a name="setRandomSeed"></a>

## setRandomSeed(seed)

Sets a global seed for reproducible simulations.

Passing `null` or `undefined` clears the seed and reverts to
`Math.random()`. Calling `setRandomSeed` twice restarts the
deterministic sequence from scratch.

**Kind**: global function

| Param | Type                                                               | Description                                                           |
| ----- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| seed  | <code>number</code> \| <code>null</code> \| <code>undefined</code> | Integer seed (coerced to 32-bit). `null`/`undefined` clears the seed. |

<a name="resetRandomSeed"></a>

## resetRandomSeed()

Resets the PRNG to use `Math.random()` for all subsequent draws.

Equivalent to `setRandomSeed(null)`. Use this at the end of a
deterministic experiment to restore nondeterministic behavior.

**Kind**: global function  
<a name="nextRandom"></a>

## nextRandom() ⇒ <code>number</code>

Returns a uniform random number in `[0, 1)`.

Uses the seeded generator when one has been installed via
`setRandomSeed`, otherwise falls through to `Math.random()`. Because
this dispatcher is called from every stochastic primitive in the
library, the _entire_ computation tree is reproducible from a single
seed.

**Kind**: global function  
**Returns**: <code>number</code> - A pseudo-random number in `[0, 1)`.  
<a name="computeKsDistance"></a>

## computeKsDistance(sample1, sample2, isSorted) ⇒ <code>number</code>

Computes the two-sample Kolmogorov-Smirnov distance.

Algorithm: a linear merged-pointer walk over the sorted order statistics.
As we walk through the sorted union we maintain the empirical CDF values
`F_n(x) = (i + 1) / n` and `G_m(x) = j / m` at the current position and
record the absolute difference. Sorting first dominates the cost; the
walk itself is `O(n + m)` where `n = sample1.length` and
`m = sample2.length`.

Input validation:

- Both samples must be non-empty arrays or `Float64Array`s.
- All values must be finite (no `NaN`, `+Infinity`, `-Infinity`).

Ties: when values are equal the walk advances both pointers and uses
`(i + 1) / n` vs. `(j + 1) / m` for the distance — this matches the
standard two-sided statistic.

**Kind**: global function  
**Returns**: <code>number</code> - KS distance `sup_x |F_n(x) - G_m(x)|` in `[0, 1]`.  
**Throws**:

- <code>Error</code> When either input is not an array/typed array, is empty,
  or contains non-finite values.

| Param    | Type                                                           | Description                                                                                                                                                                 |
| -------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sample1  | <code>Array.&lt;number&gt;</code> \| <code>Float64Array</code> | First empirical sample.                                                                                                                                                     |
| sample2  | <code>Array.&lt;number&gt;</code> \| <code>Float64Array</code> | Second empirical sample.                                                                                                                                                    |
| isSorted | <code>boolean</code>                                           | If `true`, skip sorting both samples. Off by default; setting this to `true` is the user's responsibility and is the hot path used inside `rkSAVR`'s prepared-samples loop. |

<a name="computeKsDistanceRescaled"></a>

## computeKsDistanceRescaled(sortedA, sortedB, factorA, factorB) ⇒ <code>number</code>

Kolmogorov-Smirnov distance for **already sorted** samples that need
rescaling.

Equivalent to `ksDistance(a, b, true)` but applies the rescaling factors
during the merged-pointer walk so no auxiliary allocation is needed.
Multiplication by a positive scalar is order-preserving, so the
pre-sorting of the inputs is unaffected by the choice of `factorA` and
`factorB`.

This is the hot path of the Hurstify estimator's inner loop:
`O(n + m)` per evaluation, no allocations beyond the locals below.

**Kind**: global function  
**Returns**: <code>number</code> - KS distance between the rescaled samples in `[0, 1]`.  
**Throws**:

- <code>Error</code> When either input is not an array/typed array or is empty.

| Param   | Type                                                           | Description                                           |
| ------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| sortedA | <code>Array.&lt;number&gt;</code> \| <code>Float64Array</code> | Pre-sorted sample A.                                  |
| sortedB | <code>Array.&lt;number&gt;</code> \| <code>Float64Array</code> | Pre-sorted sample B.                                  |
| factorA | <code>number</code>                                            | Positive rescaling factor for A (typically `a^{-H}`). |
| factorB | <code>number</code>                                            | Positive rescaling factor for B.                      |

<a name="shuffleArray"></a>

## shuffleArray(array) ⇒ <code>Array.&lt;\*&gt;</code>

Unbiased Fisher-Yates shuffle.

Returns a new array; the input is never mutated. Uses the seeded PRNG
exposed by `prng.js`, so the result is reproducible when a seed is set.

Complexity: `O(n)` time, `O(n)` extra memory.

**Kind**: global function  
**Returns**: <code>Array.&lt;\*&gt;</code> - Shuffled copy of `array`.

| Param | Type                          | Description                 |
| ----- | ----------------------------- | --------------------------- |
| array | <code>Array.&lt;\*&gt;</code> | Input array (not modified). |

<a name="permuteBlocks"></a>

## permuteBlocks(data, blockSize, randomPhase) ⇒ <code>Array.&lt;\*&gt;</code>

Block random permutation for decorrelating serial dependence.

Conceptually this is the paper's "preserves marginals, kills short-range
autocorrelation" operation:

1. (Optional) shift the starting index by a uniform `[-0, blockSize)`
   offset so two calls with the same seed still produce different
   alignments.
2. Slice the resulting series into blocks of length `blockSize` (the
   first block may be shorter than `blockSize` when a phase offset was
   applied).
3. Apply a Fisher-Yates shuffle to the block list.
4. Concatenate the shuffled blocks back into a single sequence.

Picking `blockSize` is the user's responsibility: it should be larger than
the dominant autocorrelation length in `data`. Too small and serial
dependence survives; too large and the number of blocks — and therefore
the effective randomization — shrinks.

**Kind**: global function  
**Returns**: <code>Array.&lt;\*&gt;</code> - Permuted array containing exactly the same elements as
`data`.  
**Throws**:

- <code>Error</code> When `data` is not array-like or `blockSize` is out of range.

| Param       | Type                          | Description                                                |
| ----------- | ----------------------------- | ---------------------------------------------------------- |
| data        | <code>Array.&lt;\*&gt;</code> | Input array (not modified).                                |
| blockSize   | <code>number</code>           | Block length; must satisfy `0 < blockSize <= data.length`. |
| randomPhase | <code>boolean</code>          | Whether to apply a random starting phase offset.           |

<a name="getRandomSample"></a>

## getRandomSample(array, n) ⇒ <code>Array.&lt;\*&gt;</code>

Floyd's Algorithm R reservoir sampler.

Streams over the input producing a uniformly random sample of size `n`
**without replacement**. Equivalent to `shuffle(array).slice(0, n)` but
uses only `O(n)` auxiliary memory and a single pass through `array`,
which matters when sampling from very large arrays (e.g. millions of
increments).

Edge cases:

- `n >= array.length`: returns a shuffled full copy of `array`.
- `n <= 0`: returns an empty array.

**Kind**: global function  
**Returns**: <code>Array.&lt;\*&gt;</code> - Random sample of size `min(n, array.length)`.

| Param | Type                          | Description                   |
| ----- | ----------------------------- | ----------------------------- |
| array | <code>Array.&lt;\*&gt;</code> | Input array.                  |
| n     | <code>number</code>           | Number of elements to sample. |

<a name="nextGaussian"></a>

## nextGaussian() ⇒ <code>number</code>

Draws a single standard normal via Box-Muller.

The polar variant is implemented by guarding against degenerate
`u === 0` draws from `nextRandom()`. One Box-Muller pair yields two
independent standard normals; this routine keeps the cosine component
and discards the sine. Use [generateCorrelatedGaussian](#generateCorrelatedGaussian) if you
need both halves, or call `nextGaussian` twice with distinct
`nextRandom()` outputs.

**Kind**: global function  
**Returns**: <code>number</code> - A standard normal random variable.  
<a name="generateGaussianBatch"></a>

## generateGaussianBatch(n) ⇒ <code>Float64Array</code>

Pre-allocates a `Float64Array` of standard normals.

Useful when an inner loop needs a contiguous buffer of normals; the
allocation is amortized across a single batch draw, whereas repeated
[nextGaussian](#nextGaussian) calls would each allocate internally.

**Kind**: global function  
**Returns**: <code>Float64Array</code> - Buffer of `n` independent standard normals.

| Param | Type                | Description                   |
| ----- | ------------------- | ----------------------------- |
| n     | <code>number</code> | Number of samples (`n >= 0`). |

<a name="generateCorrelatedGaussian"></a>

## generateCorrelatedGaussian(n, rho) ⇒ <code>Array.&lt;Float64Array&gt;</code>

Generates two correlated standard-normal streams via Cholesky.

Mathematically the model is `(Z1, Z2)` with unit marginals and
`Corr(Z1, Z2) = rho`. Implementation: draw an i.i.d. Box-Muller pair
`(z1, z2)`; set `Z1 = z1`; set `Z2 = rho * z1 + sqrt(1 - rho^2) * z2`.
Both `Z1` and `Z2` have unit variance and exactly correlation `rho`.

Important: `rho` must be **strictly** in `(-1, 1)`; the implementation
silently clamps `1 - rho^2` to zero via `Math.max(0, ...)` so the
endpoints collapse to the trivial deterministic case.

**Kind**: global function  
**Returns**: <code>Array.&lt;Float64Array&gt;</code> - `[Z1, Z2]` of length `n`.

| Param | Type                | Description                      |
| ----- | ------------------- | -------------------------------- |
| n     | <code>number</code> | Number of samples.               |
| rho   | <code>number</code> | Target correlation in `(-1, 1)`. |

<a name="generateFractionalNoise"></a>

## generateFractionalNoise(n, H) ⇒ <code>Float64Array</code>

Fractional Gaussian Noise via Hosking's method.

Hosking's method is an exact `O(n^2)` Cholesky-style recursion that
generates samples from the autocovariance
`gamma(k) = 0.5 (|k+1|^{2H} - 2|k|^{2H} + |k-1|^{2H})`.

It uses `O(n)` recursion updates to compute the conditional mean and
variance `(phi, v)` incrementally, so the per-step cost is `O(k)` and
the total `O(n^2)`. This is fine for the scales used in the paper
(a few hundred to a few thousand samples) but dominates for `n >> 1e4`.

Assumptions:

- `n > 0` and `H in (0, 1)`.
- The result is mean-zero (the recursion conditions on `x_0 ~ N(0, 1)`).

**Kind**: global function  
**Returns**: <code>Float64Array</code> - A contiguous fGN sample of length `n`.  
**Throws**:

- <code>Error</code> When `n` is not a positive finite integer or `H` is out of range.

| Param | Type                | Description                                |
| ----- | ------------------- | ------------------------------------------ |
| n     | <code>number</code> | Length of the desired sample.              |
| H     | <code>number</code> | Hurst parameter; must satisfy `0 < H < 1`. |

<a name="generateFractionalBrownianMotion"></a>

## generateFractionalBrownianMotion(n, H) ⇒ <code>Float64Array</code>

Fractional Brownian Motion by cumulative summation of fGN.

The implementation delegates the heavy lifting to [generateFractionalNoise](#generateFractionalNoise)
and then performs a single `O(n)` cumulative-sum pass. The first sample
is fixed at 0 (the standard convention for `fBM(0) = 0`), so paths
always start at the origin.

For non-zero means, simply add a constant afterwards — `fGn` is
mean-zero by construction.

**Kind**: global function  
**Returns**: <code>Float64Array</code> - fBm path of length `n` (`Float64Array(0)` when `n <= 0`).  
**Throws**:

- <code>Error</code> When `H` is out of range (propagated from `generateFractionalNoise`).

| Param | Type                | Description                                |
| ----- | ------------------- | ------------------------------------------ |
| n     | <code>number</code> | Length of the path.                        |
| H     | <code>number</code> | Hurst parameter; must satisfy `0 < H < 1`. |

<a name="computeFractionalKernel"></a>

## computeFractionalKernel(H, nSteps, dt) ⇒ <code>Float64Array</code>

Precomputes the Riemann-Liouville fractional kernel used by the
rough-volatility simulators.

Mathematically `K(t) = sqrt(2 H) * t^{H - 0.5}` for `t > 0`. The result is
a length-`nSteps` array where entry `i` corresponds to `t = (i + 1) * dt`.

Reusing a precomputed kernel for every path avoids the O(n^2) cost of
re-evaluating the power function per integration step.

**Kind**: global function  
**Returns**: <code>Float64Array</code> - Kernel values of length `nSteps`.

| Param  | Type                | Description                                 |
| ------ | ------------------- | ------------------------------------------- |
| H      | <code>number</code> | Hurst parameter.                            |
| nSteps | <code>number</code> | Number of time steps covered by the kernel. |
| dt     | <code>number</code> | Per-step time increment.                    |

<a name="computeFractionalIntegral"></a>

## computeFractionalIntegral(dW, kernel, t) ⇒ <code>number</code>

Computes a single time-step of the Riemann-Liouville fractional integral.

Given precomputed Brownian increments `dW` and a kernel from
[computeFractionalKernel](#computeFractionalKernel), returns
`I_t = sum_{j=0}^{t-1} K(t - j) * dW_j`.

Used inside the rBergomi path generator and the exact `fOU` driver.

Complexity: `O(t)` per call, so building a full path is `O(n^2)`. This
is acceptable for paths up to a few hundred steps; for long simulations
switch to a circulant-embedding FFT approximation (not implemented here).

**Kind**: global function  
**Returns**: <code>number</code> - Fractional integral value at time `t`.

| Param  | Type                      | Description                                 |
| ------ | ------------------------- | ------------------------------------------- |
| dW     | <code>Float64Array</code> | Brownian increments.                        |
| kernel | <code>Float64Array</code> | Precomputed kernel of length `>= t`.        |
| t      | <code>number</code>       | Current time index (exclusive upper bound). |

<a name="xavierInit"></a>

## xavierInit(rows, cols) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>

Xavier (Glorot-uniform) weight initialization.

Produces a `rows x cols` matrix where each entry is sampled uniformly
in `[-scale, scale]` with `scale = sqrt(2 / (rows + cols))`. This is the
standard initializer for tanh/sigmoid-activated layers (Glorot &
Bengio, 2010).

**Kind**: global function  
**Returns**: <code>Array.&lt;Array.&lt;number&gt;&gt;</code> - Initialized weight matrix.

| Param | Type                | Description        |
| ----- | ------------------- | ------------------ |
| rows  | <code>number</code> | Number of rows.    |
| cols  | <code>number</code> | Number of columns. |

<a name="getBinomialCoeffs"></a>

## getBinomialCoeffs(d, lag) ⇒ <code>Float64Array</code>

Returns the binomial coefficient sequence `[C(d, 0), ..., C(d, lag)]`.

Uses a tiny FIFO cache keyed by `${d}:${lag}` so that identical
lookups within a rolling ARFIMA run are `O(1)`. When the cache is
full the oldest entry is evicted.

**Kind**: global function  
**Returns**: <code>Float64Array</code> - Coefficient vector of length `lag + 1`.

| Param | Type                | Description              |
| ----- | ------------------- | ------------------------ |
| d     | <code>number</code> | Differencing parameter.  |
| lag   | <code>number</code> | Maximum lag (inclusive). |

<a name="fractionalDifference"></a>

## fractionalDifference(data, d, [lag]) ⇒ <code>Array.&lt;number&gt;</code>

Computes the (truncated) fractional difference of a series for a given
`d` and lag cap. The truncation to `lag` keeps the per-step cost
`O(lag)` rather than `O(t)`, which is essential for long-history
forecasting.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Fractionally differenced series.

| Param | Type                              | Default         | Description                                            |
| ----- | --------------------------------- | --------------- | ------------------------------------------------------ |
| data  | <code>Array.&lt;number&gt;</code> |                 | Input series.                                          |
| d     | <code>number</code>               |                 | Differencing parameter.                                |
| [lag] | <code>number</code>               | <code>50</code> | Maximum lag for the binomial expansion (default `50`). |

<a name="ksCriticalValue"></a>

## ksCriticalValue(n, m, alpha) ⇒ <code>number</code>

Two-sample Kolmogorov–Smirnov asymptotic critical value.

    D_alpha = sqrt(-0.5 * ln(alpha / 2)) * sqrt((n + m) / (n * m))

**Kind**: global function  
**Returns**: <code>number</code> - Critical value `D_alpha`.

| Param | Type                | Description                          |
| ----- | ------------------- | ------------------------------------ |
| n     | <code>number</code> | First sample size.                   |
| m     | <code>number</code> | Second sample size.                  |
| alpha | <code>number</code> | Significance level (default `0.05`). |

<a name="ksPvalue"></a>

## ksPvalue(D, n, m) ⇒ <code>number</code>

Approximate two-sample KS p-value via the asymptotic Kolmogorov
distribution.

    Q(lambda) ~ 2 * sum_{j=1..3} (-1)^{j-1} * exp(-2 j^2 lambda^2)

with the standard `lambda` correction.

**Kind**: global function  
**Returns**: <code>number</code> - Approximate p-value in `[0, 1]`.

| Param | Type                | Description           |
| ----- | ------------------- | --------------------- |
| D     | <code>number</code> | Observed KS distance. |
| n     | <code>number</code> | First sample size.    |
| m     | <code>number</code> | Second sample size.   |

<a name="kalmanLogLikelihood"></a>

## kalmanLogLikelihood(observations, q, r) ⇒ <code>number</code>

Log-likelihood of the observations under a 1D Kalman filter.

**Kind**: global function  
**Returns**: <code>number</code> - Total log-likelihood (or `-Infinity` for empty input).

| Param        | Type                              | Description                 |
| ------------ | --------------------------------- | --------------------------- |
| observations | <code>Array.&lt;number&gt;</code> | Time-ordered `H` estimates. |
| q            | <code>number</code>               | Process-noise variance.     |
| r            | <code>number</code>               | Measurement-noise variance. |

<a name="detectCusumBreakpoints"></a>

## detectCusumBreakpoints(hHistory, windowSize, threshold) ⇒ <code>Array.&lt;{index: number, H\_before: number, H\_after: number}&gt;</code>

Detects breakpoints in a series of H estimates via a sliding-window
CUSUM.

**Kind**: global function  
**Returns**: <code>Array.&lt;{index: number, H\_before: number, H\_after: number}&gt;</code> - Detected breakpoints in chronological order.

| Param      | Type                              | Description                           |
| ---------- | --------------------------------- | ------------------------------------- |
| hHistory   | <code>Array.&lt;number&gt;</code> | Time-ordered series of `H` estimates. |
| windowSize | <code>number</code>               | Sliding window size (default `50`).   |
| threshold  | <code>number</code>               | CUSUM threshold (default `3.0`).      |

<a name="chooseKsObjective"></a>

## chooseKsObjective([scales], [weights]) ⇒ [<code>KsObjective</code>](#KsObjective)

Selects the right `KsObjective` for a configuration.

**Kind**: global function  
**Returns**: [<code>KsObjective</code>](#KsObjective) - The matching strategy.

| Param     | Type                              | Description           |
| --------- | --------------------------------- | --------------------- |
| [scales]  | <code>Array.&lt;number&gt;</code> | Optional scale array. |
| [weights] | <code>Array.&lt;number&gt;</code> | Optional weights.     |

<a name="defaultSampler"></a>

## defaultSampler([blockSize]) ⇒ [<code>Sampler</code>](#Sampler)

Convenience: selects the default sampler based on `blockSize`.

- When `blockSize` is a positive number a `BlockPermutationSampler`
  is returned.
- Otherwise a `ReservoirSampler` is returned.

**Kind**: global function  
**Returns**: [<code>Sampler</code>](#Sampler) - Either a `BlockPermutationSampler` or a
`ReservoirSampler`.

| Param       | Type                | Description                                                                                                 |
| ----------- | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| [blockSize] | <code>number</code> | Block length for the permutation sampler; omit (or pass `0`/negative) to get the reservoir sampler instead. |

<a name="KsSignificanceResult"></a>

## KsSignificanceResult : <code>Object</code>

**Kind**: global typedef  
<a name="ConstancyResult"></a>

## ConstancyResult : <code>Object</code>

**Kind**: global typedef  
<a name="CusumBreakResult"></a>

## CusumBreakResult : <code>Object</code>

**Kind**: global typedef  
<a name="BootstrapCiResult"></a>

## BootstrapCiResult : <code>Object</code>

**Kind**: global typedef  
<a name="SimulationResult"></a>

## SimulationResult : <code>Object</code>

**Kind**: global typedef  
<a name="PriceResult"></a>

## PriceResult : <code>Object</code>

**Kind**: global typedef
